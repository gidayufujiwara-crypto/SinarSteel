import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import AsyncSessionLocal
from app.modules.auth.service import AuthService

async def main():
    async with AsyncSessionLocal() as db:
        await AuthService.create_user(db, "admin", "admin123", "Super Admin", "super_admin")
        await AuthService.create_user(db, "kasir1", "kasir123", "Kasir 1", "kasir")
        await AuthService.create_user(db, "checker1", "checker123", "Checker 1", "checker")
        await AuthService.create_user(db, "supir1", "supir123", "Supir 1", "supir")
        await AuthService.create_user(db, "kernet1", "kernet123", "Kernet 1", "kernet")
        await AuthService.create_user(db, "gudang1", "gudang123", "Gudang 1", "gudang")
        print("✅ Semua user baru berhasil dibuat")

if __name__ == "__main__":
    asyncio.run(main())