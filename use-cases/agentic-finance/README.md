# Ticker — a TypeDB + LangGraph finance example

A Bloomberg-lite market-data terminal. A LangGraph ReAct agent (Claude Opus 4.8)
answers natural-language questions about companies, securities, indices, currencies
and analyst coverage by querying a [TypeDB](https://typedb.com) database over MCP.

The example is intentionally small but exercises TypeDB's modelling features:

- **Subtyping** — abstract `security` → `equity` and `bond`.
- **Cardinality** — the standard spread (`0..1`, exactly-one, `0..many`, `1..many`,
  many-to-many) plus niche bounds: an `fx_pair` relates **exactly 2** currencies, and
  a bond's `underwriting` syndicate is **2..5** banks.
- **Functions** — `latest_price`, `market_cap` (which calls `latest_price`),
  `constituent_count`, `consensus_rating`.

See `schema/finance.tql` for the full model and `data/seed.tql` for the sample data.

## Setup

### 1. Start TypeDB + the MCP server

Both run in Docker via `docker-compose.yml`:

```bash
docker compose up -d
```

- `typedb` — the TypeDB server (HTTP on `:8000`, gRPC on `:1729`, data in the
  `typedb-data` volume).
- `typedb-mcp` — the MCP server, reachable at `http://localhost:8001/mcp`. It waits
  for `typedb` to be healthy before starting.

### 2. Install the agent (host)

The agent runs on the host. It needs **Python 3.12** — the TypeDB LangGraph plugins
support `>=3.11,<3.13`, so 3.13/3.14 won't resolve:

```bash
poetry env use python3.12
poetry install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
```

It also calls a `typeql-check` binary (set `TYPEQL_CHECK_BIN` if it isn't on `$PATH`)
to validate TypeQL before running it.

The agent uses three databases: `ticker` (the seeded finance data) plus
`langgraph_checkpoints` and `langgraph_memory`, which the plugins create on first run.

## Load the database

```bash
poetry run seed
```

This drops and recreates `TYPEDB_DATABASE` (`ticker`), defines the schema from
`schema/finance.tql`, and loads the seed data from `data/seed.tql`.

## Run the agent

```bash
poetry run agent
```

Conversation state is checkpointed in TypeDB, so it persists across restarts.

Then ask things like:

- *What's Apple's market cap?*
- *Which indices is NVDA in, and how many constituents does the Nasdaq 100 have?*
- *Who underwrote the Acme 2030 bond?*
- *What's the consensus analyst rating on Tesla?*
- *Which currency pairs include USD?*
- *Where is AAPL listed?*

## Project layout

```
docker-compose.yml   typedb-server + typedb-mcp
schema/finance.tql   TypeDB schema (entities, relations, cardinality, functions)
data/seed.tql        sample market data
src/agent/graph.py   LangGraph agent wired to the TypeDB MCP tools
src/agent/main.py    REPL entry point  (poetry run agent)
src/agent/seed.py    schema + data loader (poetry run seed)
src/agent/db.py      shared TypeDB driver connection
src/agent/tools.py   typeql_check tool
```
