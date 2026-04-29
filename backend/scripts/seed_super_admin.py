"""
Script seeder untuk membuat user super_admin awal.
Jalankan dari folder backend:
  python scripts/seed_super_admin.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import AsyncSessionLocal
from app.modules.auth.service import AuthService

async def main():
    async with AsyncSessionLocal() as db:
        # Buat super_admin
        admin = await AuthService.create_user(
            db,
            username="admin",
            password="admin123",
            full_name="Super Admin",
            role="super_admin",
        )
        print(f"✅ Super admin created: {admin.username} (ID: {admin.id})")

        # Buat user sampel untuk testing
        manager = await AuthService.create_user(
            db,
            username="manager",
            password="manager123",
            full_name="Manager Toko",
            role="manager",
        )
        print(f"✅ Manager created: {manager.username}")

        kasir = await AuthService.create_user(
            db,
            username="kasir",
            password="kasir123",
            full_name="Kasir 1",
            role="kasir",
        )
        print(f"✅ Kasir created: {kasir.username}")

        gudang = await AuthService.create_user(
            db,
            username="gudang",
            password="gudang123",
            full_name="Staff Gudang",
            role="gudang",
        )
        print(f"✅ Gudang created: {gudang.username}")

        # Di bagian bawah sebelum print selesai, tambahkan:
        karyawan1 = await AuthService.create_user(
        db,
        username="karyawan1",
        password="karyawan123",
        full_name="Karyawan 1",
        role="karyawan",
        )
        print(f"✅ Karyawan created: {karyawan1.username}")

        driver1 = await AuthService.create_user(
        db,
        username="driver1",
        password="driver123",
        full_name="Driver 1",
        role="driver",
        )
        print(f"✅ Driver created: {driver1.username}")

        print("🎉 Seeding selesai!")

if __name__ == "__main__":
    asyncio.run(main())