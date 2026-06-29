"""
Per-patient follow-up graph.

Design intent: the *decision* of whether to schedule outreach or escalate to
a human is made deterministically from a TypeDB query result, not by the LLM
— the model is only used to draft the human-facing text (the clinician note
or the patient message). This mirrors the guardrail from the original agent
design: an LLM agent should hand off rather than resolve a medication
conflict on its own.

Graph shape:

    check_interactions
       |
       +-- (interactions found) --> draft_escalation_note --> raise_escalation --> END
       |
       +-- (clean)              --> schedule_followup --> draft_patient_message --> END
"""

import os
from datetime import datetime, timezone
from typing import TypedDict

from langchain_anthropic import ChatAnthropic
from langgraph.graph import END, START, StateGraph

import typedb_client as db

MODEL_NAME = os.getenv("AGENT_MODEL", "claude-sonnet-4-6")
DEFAULT_CLINICIAN_ID = os.getenv("DEFAULT_CLINICIAN_ID", "C-01")
ON_CALL_CLINICIAN_ID = os.getenv("ON_CALL_CLINICIAN_ID", "C-02")

llm = ChatAnthropic(model=MODEL_NAME, temperature=0)


class PatientState(TypedDict, total=False):
    patient_id: str
    patient_name: str
    risk_score: float
    interactions: list[db.Interaction]
    decision: str
    clinician_note: str
    patient_message: str
    log: str


def check_interactions(state: PatientState) -> PatientState:
    interactions = db.get_drug_interactions(state["patient_id"])
    decision = "escalate" if interactions else "schedule"
    return {"interactions": interactions, "decision": decision}


def route_on_interactions(state: PatientState) -> str:
    return "draft_escalation_note" if state["decision"] == "escalate" else "schedule_followup"


def draft_escalation_note(state: PatientState) -> PatientState:
    prompt = (
        "You are drafting a brief, factual handoff note for an on-call clinician. "
        "A discharged patient's active prescriptions have a flagged drug interaction. "
        "Do not suggest a clinical resolution — only summarize the facts for a human to act on.\n\n"
        f"Patient: {state['patient_name']} (risk score {state['risk_score']:.2f})\n"
        f"Flagged interactions: {state['interactions']}\n\n"
        "Write the note in 2-3 sentences."
    )
    note = llm.invoke(prompt).content
    return {"clinician_note": note}


def raise_escalation(state: PatientState) -> PatientState:
    db.raise_escalation(
        patient_id=state["patient_id"],
        clinician_id=ON_CALL_CLINICIAN_ID,
        reason=state["clinician_note"],
        raised_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
    )
    return {"log": f"Escalated {state['patient_id']} to on-call clinician {ON_CALL_CLINICIAN_ID}"}


def schedule_followup(state: PatientState) -> PatientState:
    # 7 days out is the commonly recommended follow-up window for heart-failure
    # discharges; a real deployment would derive this from the diagnosis.
    scheduled_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    db.schedule_followup(
        patient_id=state["patient_id"],
        clinician_id=DEFAULT_CLINICIAN_ID,
        scheduled_time=scheduled_time,
        channel="telehealth",
    )
    return {"log": f"Scheduled follow-up for {state['patient_id']} with {DEFAULT_CLINICIAN_ID}"}


def draft_patient_message(state: PatientState) -> PatientState:
    prompt = (
        "Write a short, warm, plain-language SMS reminder to a patient recently "
        "discharged from hospital. Tell them they have a telehealth follow-up "
        "coming up, and list 2-3 warning signs to watch for (e.g. sudden weight "
        "gain, shortness of breath, swelling). Keep it under 60 words. "
        f"Patient name: {state['patient_name']}."
    )
    message = llm.invoke(prompt).content
    return {"patient_message": message}


def build_graph():
    graph = StateGraph(PatientState)

    graph.add_node("check_interactions", check_interactions)
    graph.add_node("draft_escalation_note", draft_escalation_note)
    graph.add_node("raise_escalation", raise_escalation)
    graph.add_node("schedule_followup", schedule_followup)
    graph.add_node("draft_patient_message", draft_patient_message)

    graph.add_edge(START, "check_interactions")
    graph.add_conditional_edges(
        "check_interactions",
        route_on_interactions,
        {"draft_escalation_note": "draft_escalation_note", "schedule_followup": "schedule_followup"},
    )
    graph.add_edge("draft_escalation_note", "raise_escalation")
    graph.add_edge("raise_escalation", END)
    graph.add_edge("schedule_followup", "draft_patient_message")
    graph.add_edge("draft_patient_message", END)

    return graph.compile()
