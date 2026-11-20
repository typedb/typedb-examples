import os
from typedb.driver import TypeDB, Credentials, DriverOptions, DriverTlsConfig, TransactionType

ADDRESS = os.getenv("TYPEDB_ADDRESS", "localhost:1729")
USERNAME = os.getenv("TYPEDB_USERNAME", "admin")
PASSWORD = os.getenv("TYPEDB_PASSWORD", "password")
DATABASE_NAME = os.getenv("TYPEDB_DATABASE", "social-network-generated")
BATCH_SIZE = 50

with open("../schema.tql") as file:
    schema = file.read()

with open("queries.tql", encoding="utf-8") as file:
    queries = [line for line in file if line.strip() and not line.strip().startswith("#")]

options = DriverOptions(DriverTlsConfig.disabled())
with TypeDB.driver(ADDRESS, Credentials(USERNAME, PASSWORD), options) as driver:
    if driver.databases.contains(DATABASE_NAME):
        driver.databases.get(DATABASE_NAME).delete()
    driver.databases.create(DATABASE_NAME)

    with driver.transaction(DATABASE_NAME, TransactionType.SCHEMA) as transaction:
        transaction.query(schema).resolve()
        transaction.commit()

    for start in range(0, len(queries), BATCH_SIZE):
        with driver.transaction(DATABASE_NAME, TransactionType.WRITE) as transaction:
            for query in queries[start:start + BATCH_SIZE]:
                transaction.query(query).resolve()
            transaction.commit()

    with driver.transaction(DATABASE_NAME, TransactionType.READ) as transaction:
        total = next(transaction.query("match $x isa! $t; reduce $count = count;").resolve().as_concept_rows())
        print(f"Total queries: {len(queries)}")
        print(f"Total instances: {total.get('count').get_integer()}")
