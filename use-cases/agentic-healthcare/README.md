# Agentic healthcare: post-discharge follow-up

## Introduction

This use case demonstrates TypeDB as the structured memory and decision layer
for an **agentic AI system**: a post-discharge follow-up agent that reduces
hospital readmissions by triaging recently discharged patients, checking for
medication conflicts, and either scheduling outreach or escalating to a
human clinician.

The agent is built with **LangGraph** and **Claude**, but the safety-critical
decision — whether to proceed automatically or hand off to a human — is made
deterministically from a TypeQL query result, not by the language model. The
model is only used to draft human-facing text (a clinician handoff note, a
patient SMS reminder). This is a deliberate design choice: an agent should
never resolve a flagged drug interaction on its own.

```
patient ──< prescription >── medication
   │                              │
   │                         interaction (drug-a, drug-b)
   │
   ├──< follow-up >── clinician
   └──< escalation >── clinician
```

Two TypeQL functions carry the domain logic so it lives in the schema, not
scattered across application code:

- `patients_needing_followup($threshold)` — high-risk patients with no
  follow-up scheduled yet.
- `flag_drug_interactions($patient)` — pairs of a patient's active
  prescriptions with a known interaction.

## Required knowledge

This demo assumes familiarity with:

- Basic TypeQL syntax (entities, relations, attributes, functions).
- TypeDB's transaction system.
- Python, and a high-level familiarity with LangGraph's `StateGraph`.

For more information, see the [TypeDB documentation](https://typedb.com/docs)
and the [LangGraph documentation](https://docs.langchain.com/oss/python/langgraph/overview).

## Getting started

### 1. Start TypeDB and load the schema and data

Install [TypeDB Community Edition](https://typedb.com/docs/home/install/ce/)
(no TypeDB Cloud account required), start the server, then run the setup
script from this directory:

```bash
typedb server
typedb console --command="transaction schema agentic-healthcare" \
                --script setup-script.tqls
```

Or interactively in [TypeDB Studio](https://typedb.com/docs/tools/studio/) /
the console: create a database called `agentic-healthcare`, run `schema.tql`
in a schema-write transaction, then `data.tql` in a data-write transaction.

### 2. Run the agent

```bash
cd agent
pip install -r requirements.txt
cp .env.example .env   # fill in ANTHROPIC_API_KEY
python main.py
```

The sample dataset (`data.tql`) includes one high-risk patient
(`P-1001`, risk score 0.81) on a flagged Lisinopril + Potassium Chloride
combination, and one lower-risk patient (`P-1002`, risk score 0.32) with no
conflicts. Running the agent should:

- Skip `P-1002` (below the risk threshold).
- For `P-1001`: detect the interaction via `flag_drug_interactions`, draft a
  clinician handoff note with Claude, and **raise an escalation instead of
  scheduling outreach automatically**.

Re-run `examples/05-list-open-escalations.tql` afterwards to see the
escalation persisted as queryable graph data.

## Project layout

```
agentic-healthcare/
├── schema.tql              # entities, relations, attributes, functions
├── data.tql                # sample patients, clinicians, medications
├── setup-script.tqls       # console script to load schema.tql + data.tql
├── examples/                # standalone TypeQL queries, no agent required
│   ├── 01-list-high-risk-patients.tql
│   ├── 02-check-drug-interactions.tql
│   ├── 03-schedule-followup.tql
│   ├── 04-raise-escalation.tql
│   └── 05-list-open-escalations.tql
└── agent/                   # the LangGraph + Claude application
    ├── typedb_client.py     # all TypeDB queries, as plain Python functions
    ├── graph.py              # the per-patient StateGraph
    ├── main.py                # entrypoint: find candidates, run the graph
    ├── requirements.txt
    └── .env.example
```

## Running the examples

If you just want to see the underlying TypeQL without installing the Python
agent, run the queries in `examples/` directly against TypeDB Studio or
Console once the schema and data are loaded — each one is annotated with
which step of the agent workflow it backs.

## Extending this demo

- Swap `flag_drug_interactions` for a real interaction dataset (e.g. RxNorm /
  DrugBank) by loading more `medication` and `interaction` data.
- Replace the fixed 7-day follow-up window in `schedule_followup` with logic
  derived from the patient's diagnosis.
- Add a `symptom-report` ingestion path (the schema already has the relation)
  so a patient's free-text reply can trigger a second pass through the graph.
