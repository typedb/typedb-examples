"""
Command-line interface for the agentic-healthcare demo.
Lets a person view patient status and trigger the agent, entirely from the terminal.
"""

from dotenv import load_dotenv
load_dotenv()

import typedb_client as db
from graph import build_graph

_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


def print_status():
    patients = db.get_all_patients()
    followups = {f["patient"]: f for f in db.get_scheduled_followups()}
    escalations = {e["patient"]: e for e in db.get_open_escalations()}

    print("\n{:<20} {:<10} {:<14} {}".format("Patient", "Risk", "Status", "Detail"))
    print("-" * 80)
    for p in patients:
        name = p["name"]
        if name in escalations:
            state, detail = "ESCALATED", escalations[name]["reason"][:50] + "..."
        elif name in followups:
            state, detail = "SCHEDULED", f"Follow-up at {followups[name]['scheduledTime']}"
        elif p["riskScore"] >= db.RISK_THRESHOLD:
            state, detail = "NEEDS REVIEW", "High risk, not yet processed"
        else:
            state, detail = "LOW RISK", "Below risk threshold"
        print("{:<20} {:<10.2f} {:<14} {}".format(name, p["riskScore"], state, detail))
    print()


def run_agent():
    candidates = db.get_patients_needing_followup()
    if not candidates:
        print("\nNo high-risk patients currently need follow-up.\n")
        return

    graph = get_graph()
    for patient in candidates:
        initial_state = {
            "patient_id": patient["id"],
            "patient_name": patient["name"],
            "risk_score": patient["riskScore"],
        }
        result = graph.invoke(initial_state)
        print(f"\n--- {patient['name']} ({patient['id']}) ---")
        print(result.get("log"))
        if result.get("clinician_note"):
            print(f"Clinician note: {result['clinician_note']}")
        if result.get("patient_message"):
            print(f"Patient message: {result['patient_message']}")
    print()


def main():
    while True:
        print("=" * 40)
        print("Agentic Healthcare Follow-Up — CLI")
        print("=" * 40)
        print("1. View patient status")
        print("2. Run agent")
        print("3. Exit")
        choice = input("Choose an option (1-3): ").strip()

        if choice == "1":
            print_status()
        elif choice == "2":
            run_agent()
        elif choice == "3":
            print("Goodbye.")
            break
        else:
            print("Please enter 1, 2, or 3.\n")


if __name__ == "__main__":
    main()
