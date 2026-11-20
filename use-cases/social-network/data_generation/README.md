# Data Generator

Generates a dataset for the social network example and loads it into TypeDB.

## Usage

Install the dependencies:

```
pip install -r requirements.txt
```

Generate the insert queries. This writes `queries.tql`, with one query per line:

```
python query_generator.py
```

Load the schema from `../schema.tql` and the generated queries into a new database:

```
python query_runner.py
```

The loader connects to `localhost:1729` as `admin` and creates a database named `social-network-generated`, replacing
it if it already exists. Override these with the `TYPEDB_ADDRESS`, `TYPEDB_USERNAME`, `TYPEDB_PASSWORD` and
`TYPEDB_DATABASE` environment variables.

The generator uses a fixed random seed, so it produces the same dataset on every run. Edit `query_generator.py` and
the files under `resources/` to change what it generates.
