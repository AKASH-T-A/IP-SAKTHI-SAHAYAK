"""
IP-SAKTI Backend — Database Initializer
Creates extensions, tables, and seeds initial authoritative statutory corpus and admin user.
"""
import asyncio
import logging
from sqlalchemy import text
from app.db.session import engine, Base
import app.models.models  # load all models
from app.core.config import settings

logger = logging.getLogger("ipsakti.init_db")


async def init_database():
    """Initializes tables and pgvector extension asynchronously."""
    async with engine.begin() as conn:
        try:
            logger.info("Attempting to enable vector extension if PostgreSQL is active...")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        except Exception as e:
            logger.warning(f"Extension creation note (safe fallback in non-superuser/sqlite envs): {e}")

        logger.info("Creating all defined tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema verification complete.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_database())
