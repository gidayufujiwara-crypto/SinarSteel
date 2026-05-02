import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import String, Text, Numeric, DateTime, Date, ForeignKey, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.base import Base

class ChartOfAccount(Base):
    __tablename__ = "chart_of_accounts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kode: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nama: Mapped[str] = mapped_column(String(100), nullable=False)
    tipe: Mapped[str] = mapped_column(String(20), nullable=False)  # aset, liabilitas, ekuitas, pendapatan, beban
    saldo_normal: Mapped[str] = mapped_column(String(6), nullable=False)  # debit / kredit
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    no_jurnal: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    tanggal: Mapped[date] = mapped_column(Date, nullable=False)
    keterangan: Mapped[str] = mapped_column(Text, nullable=True)
    referensi: Mapped[str] = mapped_column(String(50), nullable=True)  # ID transaksi POS / PO
    tipe: Mapped[str] = mapped_column(String(20), nullable=False)  # penjualan, pembelian, kas, memorial
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    items: Mapped[List["JournalEntryItem"]] = relationship(back_populates="jurnal", cascade="all, delete-orphan")

class JournalEntryItem(Base):
    __tablename__ = "journal_entry_items"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jurnal_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("journal_entries.id"), nullable=False)
    account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("chart_of_accounts.id"), nullable=False)
    deskripsi: Mapped[str] = mapped_column(String(255), nullable=True)
    debit: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    kredit: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    jurnal: Mapped["JournalEntry"] = relationship(back_populates="items")

class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    no_invoice: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    tanggal: Mapped[date] = mapped_column(Date, nullable=False)
    jatuh_tempo: Mapped[date] = mapped_column(Date, nullable=False)
    tipe: Mapped[str] = mapped_column(String(20), nullable=False)  # sale, purchase
    referensi_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    supplier_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("supplier.id"), nullable=True)
    pelanggan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("pelanggan.id"), nullable=True)
    total: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    sisa: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="unpaid")  # unpaid, partial, paid
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class CashTransaction(Base):
    __tablename__ = "cash_transactions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tanggal: Mapped[date] = mapped_column(Date, nullable=False)
    tipe: Mapped[str] = mapped_column(String(20), nullable=False)  # pemasukan, pengeluaran
    kategori: Mapped[str] = mapped_column(String(50), nullable=False)  # listrik, gaji, transport, dll
    jumlah: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    keterangan: Mapped[str] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)