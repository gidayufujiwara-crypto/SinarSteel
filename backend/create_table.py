from sqlalchemy import create_engine
from app.core.config import settings
from app.core.base import Base
from app.modules.settings.models import Setting

# Ganti +asyncpg menjadi +psycopg2 agar bisa sync
sync_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg2")

print(f"Connecting to: {sync_url}")

sync_engine = create_engine(sync_url)
Base.metadata.create_all(bind=sync_engine)

print("Tabel 'settings' berhasil dibuat!")