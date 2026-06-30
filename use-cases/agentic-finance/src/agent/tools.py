from __future__ import annotations

import os
import subprocess

from langchain_core.tools import tool


@tool
def typeql_check(query: str) -> str:
    """Validate a TypeQL query's syntax without running it.

    Use this to sanity-check any non-trivial TypeQL *before* executing it via the
    TypeDB MCP tools. Returns the string ``"valid"`` if the query parses, otherwise
    the parser's error text — fix the query and re-check until it is valid.
    """
    binary = os.getenv("TYPEQL_CHECK_BIN", "typeql-check")
    try:
        result = subprocess.run(
            [binary, query],
            capture_output=True,
            text=True,
            timeout=15,
        )
    except FileNotFoundError:
        return f"typeql-check binary not found (TYPEQL_CHECK_BIN={binary!r})"
    except subprocess.TimeoutExpired:
        return "typeql-check timed out"

    if result.returncode == 0:
        return "valid"
    # On failure the tool prints the error to stdout (falls back to stderr).
    return (result.stdout or result.stderr).strip() or "invalid query"
