import asyncio
import sys
sys.path.insert(0, 'backend')
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.session import Base
from app.models.models import *

async def main():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully on SQLite!")

if __name__ == "__main__":
    asyncio.run(main())
