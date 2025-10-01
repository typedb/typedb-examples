import os

TYPEDB_ADDRESS = os.getenv("TYPEDB_ADDRESS", "localhost:1729")
TYPEDB_USERNAME = os.getenv("TYPEDB_USERNAME", "admin")
TYPEDB_PASSWORD = os.getenv("TYPEDB_PASSWORD", "password")
TYPEDB_TLS_ENABLED = os.getenv("TYPEDB_TLS_ENABLED", "false").lower() == "true"
TYPEDB_DATABASE = os.getenv("TYPEDB_DATABASE", "social-network")
