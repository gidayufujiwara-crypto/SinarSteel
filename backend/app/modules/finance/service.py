import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.modules.finance.models import ChartOfAccount, JournalEntry, JournalEntryItem, Invoice, CashTransaction
from app.modules.auth.models import User

class FinanceService:
    @staticmethod
    async def generate_no_jurnal(db: AsyncSession) -> str:
        today = date.today().strftime("%Y%m%d")
        result = await db.execute(
            select(JournalEntry.no_jurnal)
            .where(JournalEntry.no_jurnal.like(f"JRN-{today}-%"))
            .order_by(JournalEntry.no_jurnal.desc()).limit(1)
        )
        last = result.scalar_one_or_none()
        if last:
            num = int(last.split("-")[-1]) + 1
        else:
            num = 1
        return f"JRN-{today}-{num:04d}"

    @staticmethod
    async def create_journal(db: AsyncSession, data: dict, user: User) -> JournalEntry:
        # Validasi keseimbangan debit-kredit
        items = data["items"]
        total_debit = sum(item["debit"] for item in items)
        total_kredit = sum(item["kredit"] for item in items)
        if total_debit != total_kredit:
            raise ValueError("Total Debit harus sama dengan Total Kredit")

        no_jurnal = await FinanceService.generate_no_jurnal(db)
        jurnal = JournalEntry(
            no_jurnal=no_jurnal,
            tanggal=data["tanggal"],
            keterangan=data.get("keterangan"),
            referensi=data.get("referensi"),
            tipe=data["tipe"],
            created_by=user.id,
        )
        db.add(jurnal)
        await db.flush()

        for item in items:
            ji = JournalEntryItem(
                jurnal_id=jurnal.id,
                account_id=item["account_id"],
                deskripsi=item.get("deskripsi"),
                debit=item["debit"],
                kredit=item["kredit"],
            )
            db.add(ji)

        await db.commit()
        await db.refresh(jurnal)
        return jurnal

    @staticmethod
    async def get_journal_list(db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[JournalEntry]:
        stmt = select(JournalEntry).order_by(JournalEntry.tanggal.desc())
        if start_date and end_date:
            stmt = stmt.where(and_(JournalEntry.tanggal >= start_date, JournalEntry.tanggal <= end_date))
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_profit_loss(db: AsyncSession, bulan: int, tahun: int) -> List[dict]:
        # Query untuk Laba Rugi per produk
        # Gabungkan data penjualan (TransaksiItem) dan HPP (dari Produk.hpp_rata_rata x qty)
        from app.modules.pos.models import Transaksi, TransaksiItem
        from app.modules.master.models import Produk

        start_date = date(tahun, bulan, 1)
        if bulan == 12:
            end_date = date(tahun+1, 1, 1)
        else:
            end_date = date(tahun, bulan+1, 1)

        result = await db.execute(
            select(
                Produk.nama,
                func.sum(TransaksiItem.subtotal).label("total_pendapatan"),
                func.sum(Produk.hpp_rata_rata * TransaksiItem.qty).label("total_hpp"),
            )
            .join(TransaksiItem, TransaksiItem.produk_id == Produk.id)
            .join(Transaksi, Transaksi.id == TransaksiItem.transaksi_id)
            .where(Transaksi.created_at >= start_date, Transaksi.created_at < end_date, Transaksi.status == "selesai")
            .group_by(Produk.id, Produk.nama)
        )
        rows = result.all()
        return [
            {
                "nama_produk": row.nama,
                "total_pendapatan": row.total_pendapatan or 0,
                "total_hpp": row.total_hpp or 0,
                "laba_kotor": (row.total_pendapatan or 0) - (row.total_hpp or 0),
            }
            for row in rows
        ]

    @staticmethod
    async def create_cash_transaction(db: AsyncSession, data: dict, user: User) -> CashTransaction:
        ct = CashTransaction(
            tanggal=data["tanggal"],
            tipe=data["tipe"],
            kategori=data["kategori"],
            jumlah=data["jumlah"],
            keterangan=data.get("keterangan"),
            created_by=user.id,
        )
        db.add(ct)
        await db.commit()
        await db.refresh(ct)
        return ct

    @staticmethod
    async def get_cash_list(db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[CashTransaction]:
        stmt = select(CashTransaction).order_by(CashTransaction.tanggal.desc())
        if start_date and end_date:
            stmt = stmt.where(and_(CashTransaction.tanggal >= start_date, CashTransaction.tanggal <= end_date))
        result = await db.execute(stmt)
        return result.scalars().all()