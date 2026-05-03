import asyncio, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from app.core.database import AsyncSessionLocal
from app.modules.finance.models import ChartOfAccount

async def main():
    coa_list = [
        ("101", "Kas", "aset", "debit"),
        ("102", "Piutang COD", "aset", "debit"),
        ("103", "Persediaan Barang", "aset", "debit"),
        ("201", "Hutang Supplier", "liabilitas", "kredit"),
        ("301", "Modal Pemilik", "ekuitas", "kredit"),
        ("400", "Pendapatan Penjualan", "pendapatan", "kredit"),
        ("500", "Harga Pokok Penjualan", "beban", "debit"),
        ("501", "Beban Gaji", "beban", "debit"),
        ("502", "Beban Listrik & Air", "beban", "debit"),
        ("503", "Beban Transport", "beban", "debit"),
    ]
    async with AsyncSessionLocal() as db:
        for kode, nama, tipe, saldo_normal in coa_list:
            existing = await db.execute(
                select(ChartOfAccount).where(ChartOfAccount.kode == kode)
            )
            if not existing.scalar_one_or_none():
                db.add(ChartOfAccount(kode=kode, nama=nama, tipe=tipe, saldo_normal=saldo_normal))
        await db.commit()
        print("✅ COA berhasil diisi")

if __name__ == "__main__":
    asyncio.run(main())