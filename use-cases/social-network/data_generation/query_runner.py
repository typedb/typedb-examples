from collections.abc import Iterator
from typedb.api.answer.concept_map import ConceptMap
from typedb.api.connection.session import SessionType, TypeDBSession
from typedb.api.connection.transaction import TransactionType, TypeDBTransaction
from typedb.common.exception import TypeDBDriverException
from typedb.driver import TypeDB


class BatchLoader:
    def __init__(self, session: TypeDBSession, batch_size: int):
        self.session = session
        self.batch_size = batch_size
        self._query_count = 0
        self.query_total = 0
        self._transaction: TypeDBTransaction

    def __enter__(self):
        self._transaction = self.session.transaction(TransactionType.WRITE)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self._transaction.close()
        except TypeDBDriverException:
            pass

    def insert(self, query: str) -> Iterator[ConceptMap]:
        if self._query_count >= self.batch_size:
            self.commit()

        self._query_count += 1
        self.query_total += 1
        return self._transaction.query.insert(query)

    def commit(self):
        self._transaction.commit()
        self._transaction = self.session.transaction(TransactionType.WRITE)
        self._query_count = 0

    @property
    def instance_total(self) -> int:
        with self.session.transaction(TransactionType.READ) as transaction:
            total = transaction.query.get_aggregate(query="match $x isa $t; get $x; count;").resolve().as_long()

        return total


DATABASE_NAME = "social-media-3.0"

with open("social_media/schema.tql") as file:
    schema = file.read()

with TypeDB.core_driver("localhost:1729") as driver:
    if driver.databases.contains(DATABASE_NAME):
        driver.databases.get(DATABASE_NAME).delete()

    driver.databases.create(DATABASE_NAME)

    with driver.session(DATABASE_NAME, SessionType.SCHEMA) as session:
        with session.transaction(TransactionType.WRITE) as transaction:

            transaction.query.define(schema)
            transaction.commit()

    with driver.session(DATABASE_NAME, SessionType.DATA) as session:
        with BatchLoader(session, batch_size=50) as batch_loader:
            with open("social_media/queries.tql") as file:
                for line in file:
                    if line.strip() == "" or line.strip()[0] == "#":
                        continue
                    else:
                        batch_loader.insert(line)

            batch_loader.commit()
            print(f"Total queries: {batch_loader.query_total}")
            print(f"Total instances: {batch_loader.instance_total}")
