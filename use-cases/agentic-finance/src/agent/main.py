from __future__ import annotations

import asyncio
import os

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage

from agent.graph import MODEL, build_agent


async def run_repl() -> None:
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise SystemExit("ANTHROPIC_API_KEY is not set (see .env.example).")

    print("typedb-langgraph-example — TypeDB-backed memory agent")
    print(f"  model          = {MODEL}")
    print(f"  TYPEDB_MCP_URL = {os.getenv('TYPEDB_MCP_URL', '<unset>')}")
    print("Type a message, or 'exit' / Ctrl-D to quit.\n")

    agent = await build_agent()
    # A fixed thread_id keeps the whole REPL session in one conversation.
    config = {"configurable": {"thread_id": "repl"}}

    while True:
        try:
            user_input = input("you> ").strip()
        except EOFError:
            print()
            break
        if user_input.lower() in {"exit", "quit"}:
            break
        if not user_input:
            continue

        result = await agent.ainvoke(
            {"messages": [HumanMessage(content=user_input)]},
            config=config,
        )
        print(f"bot> {result['messages'][-1].content}\n")


def main() -> None:
    load_dotenv()
    try:
        asyncio.run(run_repl())
    except KeyboardInterrupt:
        print()


if __name__ == "__main__":
    main()
