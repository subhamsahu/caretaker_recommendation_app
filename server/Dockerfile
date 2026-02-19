# ----------  Build stage  ----------
FROM python:3.12-slim AS base

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Persist the SQLite file in a volume-mountable location
VOLUME ["/app/data"]
ENV DATABASE_URL=sqlite+aiosqlite:////app/data/kidcare.db

# Run seed then start uvicorn
CMD ["sh", "-c", "python seed.py && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]
