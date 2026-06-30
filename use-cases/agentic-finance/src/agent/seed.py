from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from typedb.driver import TransactionType

from agent.db import connect

# database/ lives at the repo root, two levels up from this file.
_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_FILE = _ROOT / "database" / "schema.tql"
DATA_FILE = _ROOT / "database" / "data.tql"


def _split_queries(text: str) -> list[str]:
    """Split a .tql file into individual queries.

    Queries are separated by blank lines; lines starting with ``#`` are comments
    and are dropped. A block that is only comments contributes no query.
    """
    queries: list[str] = []
    for block in text.split("\n\n"):
        body = "\n".join(l for l in block.splitlines() if not l.strip().startswith("#"))
        if body.strip():
            queries.append(body.strip())
    return queries


def main() -> None:
    """(Re)create the database, define the finance schema, and load seed data."""
    load_dotenv()
    db_name = os.getenv("TYPEDB_DATABASE", "ticker")

    schema = SCHEMA_FILE.read_text()
    data_queries = _split_queries(DATA_FILE.read_text())

    driver = connect()
    try:
        if driver.databases.contains(db_name):
            print(f"Dropping existing database '{db_name}'...")
            driver.databases.get(db_name).delete()
        driver.databases.create(db_name)
        print(f"Created database '{db_name}'.")

        with driver.transaction(db_name, TransactionType.SCHEMA) as tx:
            tx.query(schema).resolve()
            tx.commit()
        print("Schema defined.")

        with driver.transaction(db_name, TransactionType.WRITE) as tx:
            for q in data_queries:
                tx.query(q).resolve()
            tx.commit()
        print(f"Loaded {len(data_queries)} seed queries.")
    finally:
        driver.close()

    print("Done. Start the agent with `poetry run agent`.")


if __name__ == "__main__":
    main()
