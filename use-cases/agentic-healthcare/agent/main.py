from dotenv import load_dotenv
load_dotenv()
"""
Entrypoint: find every high-risk, not-yet-followed-up patient in TypeDB and
run the per-patient LangGraph for each of them.
"""

import typedb_client as db
from graph import build_graph


def main():
    candidates = db.get_patients_needing_followup()
    if not candidates:
        print("No high-risk patients currently need follow-up.")
        return

    graph = build_graph()

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


if __name__ == "__main__":
    main()
