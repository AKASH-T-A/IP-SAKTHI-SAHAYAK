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

    # Seed admin user if not present
    from app.db.session import AsyncSessionLocal
    from app.models.models import User, UserRole
    from app.core.security import get_password_hash
    from sqlalchemy import select

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == settings.first_admin_email)
        )
        existing_admin = result.scalar_one_or_none()
        if not existing_admin:
            logger.info(f"Seeding first admin user: {settings.first_admin_email}")
            admin_user = User(
                email=settings.first_admin_email,
                name="Sakti Administrator",
                hashed_password=get_password_hash(settings.first_admin_password),
                role=UserRole.admin,
                language_preference="en",
                is_active=True,
            )
            session.add(admin_user)
            await session.commit()
            logger.info("Admin user seeded successfully.")
        else:
            logger.info(f"Admin user {settings.first_admin_email} already exists.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_database())
