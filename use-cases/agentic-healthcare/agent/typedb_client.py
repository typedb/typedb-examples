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
