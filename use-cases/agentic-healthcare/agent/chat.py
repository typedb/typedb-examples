
"""
Agentic Healthcare Assistant (stable version)

Fixes:
- LangChain tool docstring requirement
- Anthropic overload errors (529/500)
- NoneType crash protection
- message history explosion
"""

from dotenv import load_dotenv
load_dotenv()

import os
import time
import random

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

import typedb_client as db


# -----------------------
# CONFIG
# -----------------------

MODEL_NAME = os.getenv("AGENT_MODEL", "claude-3-5-haiku-latest")
MAX_RETRIES = 5


# -----------------------
# TOOLS (ALL MUST HAVE DOCSTRINGS)
# -----------------------

@tool
def list_patients() -> list[dict]:
    """List all patients in the system with their current status."""
    return db.get_all_patients()


@tool
def patient_detail(patient_id: str) -> dict:
    """Get full details of a patient by ID (e.g. P-1001)."""
    return db.get_patient_detail(patient_id)


@tool
def resolve_escalation(patient_id: str) -> str:
    """Resolve an open escalation for a patient."""
    ok = db.resolve_escalation(patient_id)
    return (
        f"Escalation for {patient_id} resolved."
        if ok
        else f"No escalation found for {patient_id}."
    )


@tool
def add_patient(
    patient_id: str,
    name: str,
    dob: str,
    phone: str,
    lives_alone: bool,
    risk_score: float,
) -> str:
    """Add a new patient to the system."""
    try:
        db.insert_patient(patient_id, name, dob, phone, lives_alone, risk_score)
        return f"Added patient {name} ({patient_id})."
    except Exception as e:
        return f"Failed to add patient: {e}"


TOOLS = [
    list_patients,
    patient_detail,
    resolve_escalation,
    add_patient,
]


# -----------------------
# LLM + AGENT
# -----------------------

llm = ChatAnthropic(
    model=MODEL_NAME,
    temperature=0,
    max_retries=2,
)

agent = create_react_agent(llm, TOOLS)


# -----------------------
# SAFE INVOKE (IMPORTANT FIX)
# -----------------------

def invoke_agent(messages):
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            return agent.invoke({"messages": messages})

        except Exception as e:
            last_error = e
            msg = str(e).lower()

            retryable = (
                "overloaded" in msg
                or "529" in msg
                or "500" in msg
                or "internal server error" in msg
            )

            if not retryable:
                raise

            wait = min(10, (2 ** attempt)) + random.uniform(0, 1.0)
            print(f"[Retry] API issue → waiting {wait:.1f}s")
            time.sleep(wait)

    raise RuntimeError(f"Agent failed after retries: {last_error}")


# -----------------------
# MAIN LOOP
# -----------------------

def main():
    print("Agentic Healthcare Assistant (stable)\n")

    messages = []

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() in ("exit", "quit"):
            print("Goodbye.")
            break

        if not user_input:
            continue

        messages.append(HumanMessage(content=user_input))

        # IMPORTANT: prevent token explosion
        messages = messages[-6:]

        result = invoke_agent(messages)

        if result is None:
            print("No response from agent.")
            continue

        messages = result["messages"]

        print("\nAssistant:", messages[-1].content, "\n")


if __name__ == "__main__":
    main()
