"""
Thin wrapper around the TypeDB driver for the agentic-healthcare use case.

Every function here opens its own short-lived transaction and returns plain
Python data structures, so the LangGraph nodes in graph.py never touch the
driver directly.
"""

import os
from typing import TypedDict

from typedb.driver import Credentials, DriverOptions, DriverTlsConfig, TransactionType, TypeDB

TYPEDB_ADDRESS = os.getenv("TYPEDB_ADDRESS", "localhost:1729")
TYPEDB_USERNAME = os.getenv("TYPEDB_USERNAME", "admin")
TYPEDB_PASSWORD = os.getenv("TYPEDB_PASSWORD", "password")
TYPEDB_TLS_ENABLED = os.getenv("TYPEDB_TLS_ENABLED", "false").lower() == "true"
TYPEDB_DATABASE = os.getenv("TYPEDB_DATABASE", "agentic-healthcare")

RISK_THRESHOLD = float(os.getenv("RISK_THRESHOLD", "0.7"))


class Interaction(TypedDict):
    drugA: str
    drugB: str
    severity: str


def _driver():
    tls_config = DriverTlsConfig.enabled_with_native_root_ca() if TYPEDB_TLS_ENABLED else DriverTlsConfig.disabled()
    return TypeDB.driver(
        TYPEDB_ADDRESS,
        Credentials(TYPEDB_USERNAME, TYPEDB_PASSWORD),
        DriverOptions(tls_config),
    )


def get_patients_needing_followup() -> list[dict]:
    """Patients above RISK_THRESHOLD with no follow-up scheduled yet."""
    query = f"""
        match
            let $p in patients_needing_followup({RISK_THRESHOLD});
            $p has patient-id $id, has name $name, has readmission-risk-score $score;
        fetch {{
            "id": $id,
            "name": $name,
            "riskScore": $score,
        }};
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def get_drug_interactions(patient_id: str) -> list[Interaction]:
    """Any pair of the patient's active prescriptions with a known interaction."""
    query = f"""
        match
            $p isa patient, has patient-id "{patient_id}";
            let $m1, $m2, $sev in flag_drug_interactions($p);
            $m1 has med-name $n1;
            $m2 has med-name $n2;
        fetch {{
            "drugA": $n1,
            "drugB": $n2,
            "severity": $sev,
        }};
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def schedule_followup(patient_id: str, clinician_id: str, scheduled_time: str, channel: str = "telehealth") -> None:
    query = f"""
        match
            $p isa patient, has patient-id "{patient_id}";
            $c isa clinician, has clinician-id "{clinician_id}";
        insert
            follow-up (patient: $p, assigned-clinician: $c),
                has scheduled-time {scheduled_time},
                has channel "{channel}",
                has status "scheduled";
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def raise_escalation(patient_id: str, clinician_id: str, reason: str, raised_at: str) -> None:
    safe_reason = reason.replace('"', "'")
    query = f"""
        match
            $p isa patient, has patient-id "{patient_id}";
            $c isa clinician, has clinician-id "{clinician_id}";
        insert
            escalation (patient: $p, on-call-clinician: $c),
                has reason "{safe_reason}",
                has raised-at {raised_at},
                has status "open";
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def get_all_patients() -> list[dict]:
    """Every patient, regardless of risk or follow-up status."""
    query = """
        match
            $p isa patient, has patient-id $id, has name $name, has readmission-risk-score $score;
        fetch {
            "id": $id,
            "name": $name,
            "riskScore": $score,
        };
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def get_scheduled_followups() -> list[dict]:
    """All currently scheduled follow-ups, keyed by patient name."""
    query = """
        match
            follow-up (patient: $p, assigned-clinician: $c), has scheduled-time $t, has status "scheduled";
            $p has name $pname;
            $c has name $cname;
        fetch {
            "patient": $pname,
            "clinician": $cname,
            "scheduledTime": $t,
        };
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def get_open_escalations() -> list[dict]:
    """All open escalations, keyed by patient name."""
    query = """
        match
            escalation (patient: $p, on-call-clinician: $c), has reason $reason, has status "open";
            $p has name $pname;
            $c has name $cname;
        fetch {
            "patient": $pname,
            "clinician": $cname,
            "reason": $reason,
        };
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def get_all_patients() -> list[dict]:
    """Every patient, regardless of risk or follow-up status."""
    query = """
        match
            $p isa patient, has patient-id $id, has name $name, has readmission-risk-score $score;
        fetch {
            "id": $id,
            "name": $name,
            "riskScore": $score,
        };
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def get_scheduled_followups() -> list[dict]:
    """All currently scheduled follow-ups, keyed by patient name."""
    query = """
        match
            follow-up (patient: $p, assigned-clinician: $c), has scheduled-time $t, has status "scheduled";
            $p has name $pname;
            $c has name $cname;
        fetch {
            "patient": $pname,
            "clinician": $cname,
            "scheduledTime": $t,
        };
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def get_open_escalations() -> list[dict]:
    """All open escalations, keyed by patient name."""
    query = """
        match
            escalation (patient: $p, on-call-clinician: $c), has reason $reason, has status "open";
            $p has name $pname;
            $c has name $cname;
        fetch {
            "patient": $pname,
            "clinician": $cname,
            "reason": $reason,
        };
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        return list(tx.query(query).resolve().as_concept_documents())


def get_patient_detail(patient_id: str) -> dict:
    """Full profile for one patient: attributes + every prescription."""
    query = f"""
        match
            $p isa patient, has patient-id "{patient_id}";
        fetch {{
            "id": $p.patient-id,
            "name": $p.name,
            "dob": $p.dob,
            "phone": $p.phone,
            "livesAlone": $p.lives-alone,
            "riskScore": $p.readmission-risk-score,
            "prescriptions": [
                match
                    $rx (patient: $p, drug: $m, prescriber: $c) isa prescription,
                        has dose $dose, has frequency $freq, has status $status;
                    $m has med-name $medname;
                    $c has name $clinname;
                fetch {{
                    "medication": $medname,
                    "dose": $dose,
                    "frequency": $freq,
                    "status": $status,
                    "prescriber": $clinname,
                }};
            ],
        }};
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
        results = list(tx.query(query).resolve().as_concept_documents())
        return results[0] if results else None


def insert_patient(patient_id: str, name: str, dob: str, phone: str, lives_alone: bool, risk_score: float) -> None:
    """Add a brand-new patient to the database."""
    query = f"""
        insert
            $p isa patient,
                has patient-id "{patient_id}",
                has name "{name}",
                has dob {dob},
                has phone "{phone}",
                has lives-alone {str(lives_alone).lower()},
                has readmission-risk-score {risk_score};
    """
    with _driver() as driver, driver.transaction(TYPEDB_DATABASE, TransactionType.WRITE) as tx:
        tx.query(query).resolve()
        tx.commit()


def resolve_escalation(patient_id: str) -> bool:
    """Mark a patient's open escalation as resolved. Returns False if none was open."""
    check_query = f"""
        match
            $p isa patient, has patient-id "{patient_id}";
            escalation (patient: $p), has status "open";
        select $p;
    """
    update_query = f"""
        match
            $p isa patient, has patient-id "{patient_id}";
            $e (patient: $p, on-call-clinician: $c) isa escalation, has status "open";
        update
            $e has status "resolved";
    """
    with _driver() as driver:
        with driver.transaction(TYPEDB_DATABASE, TransactionType.READ) as tx:
            if not list(tx.query(check_query).resolve().as_concept_rows()):
                return False
        with driver.transaction(TYPEDB_DATABASE, TransactionType.WRITE) as tx:
            tx.query(update_query).resolve()
            tx.commit()
        return True
