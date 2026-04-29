"""
Membuat seluruh tabel langsung ke database (sync).
Dengan echo=True, Anda bisa melihat DDL yang dikirim.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine, inspect
from app.core.config import settings
from app.core.base import Base
from app.models import *  # noqa

# Ganti asyncpg -> psycopg2
sync_url = settings.DATABASE_URL.replace("+asyncpg", "")

print(f"🔌 Menghubungkan ke: {sync_url}")
engine = create_engine(sync_url, echo=True)

# Cek dulu apakah tabel sudah ada
insp = inspect(engine)
existing = insp.get_table_names()
print(f"📋 Tabel saat ini: {existing}")

if "users" in existing:
    print("✅ Tabel 'users' sudah ada, tidak perlu membuat ulang.")
else:
    print("📦 Membuat semua tabel...")
    Base.metadata.create_all(engine)
    # Verifikasi ulang
    insp = inspect(engine)
    new_tables = insp.get_table_names()
    print(f"📋 Tabel setelah create_all: {new_tables}")
    if "users" in new_tables:
        print("✅ Tabel 'users' berhasil dibuat.")
    else:
        print("❌ GAGAL membuat tabel! Periksa log SQL di atas.")