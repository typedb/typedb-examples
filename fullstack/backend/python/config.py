import os

TYPEDB_ADDRESS = os.environ.get('TYPEDB_ADDRESS', "localhost:1729")
TYPEDB_USERNAME = "admin"
TYPEDB_PASSWORD = "password"
TYPEDB_TLS_ENABLED = False
TYPEDB_DATABASE = "social-network"
