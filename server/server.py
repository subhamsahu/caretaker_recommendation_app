"""
server.py - Entrypoint to start the FastAPI server for KidCare Recommendation App.
"""

import uvicorn
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this file (server/)
load_dotenv(Path(__file__).resolve().parent / ".env")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        app_dir="."
    )
