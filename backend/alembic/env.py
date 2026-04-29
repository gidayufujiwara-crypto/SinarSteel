import asyncio
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Tambahkan path root aplikasi
sys.path.insert(0, ".")

from app.core.base import Base
from app.models import *  # noqa: F401, F403  # import semua model agar Alembic bisa melihat metadata

# Ini adalah Alembic Config object
config = context.config

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata yang akan digunakan untuk auto-generate
target_metadata = Base.metadata

def get_url():
    """Ubah URL sync menjadi async jika diperlukan."""
    url = config.get_main_option("sqlalchemy.url")
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://")
    return url

def run_migrations_offline() -> None:
    """Jalankan migrasi dalam mode offline."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    """Fungsi sync untuk menjalankan migrasi dari connection sync."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Jalankan migrasi menggunakan async engine."""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # Gunakan run_sync untuk menjalankan fungsi sync dari koneksi async
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Jalankan migrasi dalam mode online (async)."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()