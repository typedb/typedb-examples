from __future__ import annotations

import os

from langchain_anthropic import ChatAnthropic
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.graph.state import CompiledStateGraph
from langgraph.prebuilt import create_react_agent
from langgraph_checkpoint_typedb import AsyncTypeDBSaver, TypeDBSaver
from langgraph_store_typedb import AsyncTypeDBStore, TypeDBStore

from agent.db import connect
from agent.tools import typeql_check

# Opus 4.8 is the most capable model; it drives the agent's tool-use loop.
MODEL = "claude-opus-4-8"

SYSTEM_PROMPT = """\
You have access to TypeDB tools (exposed over MCP) that let you query the `ticker`
database with TypeQL. Use them to answer the user's questions with real data — never
invent figures.

Before running any non-trivial TypeQL over MCP, validate it with the `typeql_check`
tool; if it reports an error, fix the query and re-check before executing it.
"""


def _mcp_client() -> MultiServerMCPClient:
    """Build an MCP client pointed at the TypeDB MCP server from the environment."""
    url = os.environ.get("TYPEDB_MCP_URL", "http://localhost:8001/mcp")
    return MultiServerMCPClient(
        {
            "typedb": {
                "url": url,
                "transport": "streamable_http",
            }
        }
    )


async def build_agent() -> CompiledStateGraph:
    """Construct the LangGraph ReAct agent wired to the TypeDB MCP tools.

    Conversation state is checkpointed in TypeDB (``langgraph_checkpoints``) so it
    survives across processes, keyed by ``thread_id`` at invoke time. A TypeDB-backed
    long-term ``store`` (``langgraph_memory``) is also attached and reachable from
    tools via ``get_store()``.
    """
    client = _mcp_client()
    mcp_tools = await client.get_tools()
    tools = mcp_tools + [typeql_check]

    # A single direct driver connection backs both the checkpointer and the store.
    # The agent runs via ``ainvoke``, so we wrap each sync saver/store in its async
    # adapter (the async classes delegate to the sync one). ensure_database()/
    # ensure_schema() live on the sync objects and create the DBs on first run.
    driver = connect()
    sync_checkpointer = TypeDBSaver(
        driver, database=os.getenv("TYPEDB_CHECKPOINT_DB", "langgraph_checkpoints")
    )
    sync_checkpointer.ensure_database()
    sync_checkpointer.ensure_schema()
    checkpointer = AsyncTypeDBSaver(sync_checkpointer)

    sync_store = TypeDBStore(driver, database=os.getenv("TYPEDB_STORE_DB", "langgraph_memory"))
    sync_store.ensure_database()
    sync_store.ensure_schema()
    store = AsyncTypeDBStore(sync_store)

    model = ChatAnthropic(model=MODEL, max_tokens=8192)

    return create_react_agent(
        model,
        tools,
        prompt=SYSTEM_PROMPT,
        checkpointer=checkpointer,
        store=store,
    )
    # ponytail: store is wired and available (get_store) but the agent isn't given
    # explicit memory-write tools yet — cross-session long-term memory UX is a
    # follow-up, not built now.
