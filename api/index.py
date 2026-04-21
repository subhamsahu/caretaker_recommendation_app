"""
Vercel serverless entry point for the FastAPI backend.

Vercel's Python runtime natively supports ASGI apps — no Mangum adapter needed.
The `sys.path` insertion makes the `server/` package importable without
any import-path changes in the existing source files.
"""

import os
import sys

# Make the server package importable from this api/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "server"))

from main import app  # noqa: E402  (import after sys.path mutation)

# Vercel's Python runtime detects ASGI apps natively — no Mangum needed.
# The `handler` name is the conventional entry point Vercel looks for.
handler = app
