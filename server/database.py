"""
Database configuration and session management.
Uses SQLAlchemy async engine with aiosqlite for local testing.
"""

import os
import ssl
from pathlib import Path
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Database URL from environment variable (fallback: local SQLite file)
_default_db_path = Path(__file__).resolve().parent / "kidcare.db"
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{_default_db_path}",
)

# Hosted providers (Neon, Supabase, Railway, Render) expose a plain
# "postgresql://" or "postgres://" URL.  SQLAlchemy's async engine
# requires the "+asyncpg" driver suffix, so we inject it here.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# asyncpg does not understand libpq query params like sslmode= or channel_binding=.
# Strip them from the URL and translate to connect_args instead.
_connect_args: dict = {}
if DATABASE_URL.startswith("postgresql+asyncpg"):
    parsed = urlparse(DATABASE_URL)
    params = parse_qs(parsed.query)

    requires_ssl = params.pop("sslmode", ["disable"])[0] == "require"
    params.pop("channel_binding", None)   # not supported by asyncpg

    # Rebuild the URL without those params
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    DATABASE_URL = urlunparse(parsed._replace(query=clean_query))

    if requires_ssl:
        _ssl_ctx = ssl.create_default_context()
        _ssl_ctx.check_hostname = False
        _ssl_ctx.verify_mode = ssl.CERT_NONE
        _connect_args["ssl"] = _ssl_ctx
elif DATABASE_URL.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}

engine = create_async_engine(DATABASE_URL, echo=False, future=True, connect_args=_connect_args)

# Session factory
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup (development convenience)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
