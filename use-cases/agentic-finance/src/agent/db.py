from __future__ import annotations

import os

from typedb.driver import (
    Credentials,
    DriverOptions,
    DriverTlsConfig,
    TypeDB,
)


def connect():
    """Open a TypeDB driver from the environment.

    Shared by ``seed.py`` (loads the ``ticker`` data DB) and ``graph.py`` (opens the
    checkpoint/store DBs). Reads ``TYPEDB_ADDRESS`` / ``TYPEDB_USERNAME`` /
    ``TYPEDB_PASSWORD``; the driver wants a ``host:port`` authority, not a URL scheme.
    """
    # The Python driver speaks gRPC on :1729 (the HTTP API on :8000 is what the MCP
    # server uses). Point TYPEDB_ADDRESS at the gRPC port.
    address = os.getenv("TYPEDB_ADDRESS", "localhost:1729")
    address = address.removeprefix("http://").removeprefix("https://")
    creds = Credentials(
        os.getenv("TYPEDB_USERNAME", "admin"),
        os.getenv("TYPEDB_PASSWORD", "password"),
    )
    return TypeDB.driver(address, creds, DriverOptions(DriverTlsConfig.disabled()))
