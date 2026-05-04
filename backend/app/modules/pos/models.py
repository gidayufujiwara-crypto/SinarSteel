import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import String, Integer, Numeric, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.base import Base

class Shift(Base):
    __tablename__ = "shift"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kasir_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    waktu_buka: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    waktu_tutup: Mapped[Optional[datetime]] = mapped_column(DateTime)
    total_transaksi: Mapped[int] = mapped_column(Integer, default=0)
    total_tunai: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    total_transfer: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    total_qris: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    saldo_awal: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="buka")  # buka / tutup

    transaksi: Mapped[List["Transaksi"]] = relationship(back_populates="shift")

class Transaksi(Base):
    __tablename__ = "transaksi"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    no_transaksi: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    kasir_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pelanggan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("pelanggan.id"))
    shift_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("shift.id"))
    jenis_pembayaran: Mapped[str] = mapped_column(String(20), nullable=False)  # tunai, transfer, qris, kredit
    status: Mapped[str] = mapped_column(String(20), default="selesai")  # selesai / void / kredit
    total_sebelum_diskon: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    diskon_total: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    total_setelah_diskon: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    bayar: Mapped[Optional[Decimal]] = mapped_column(Numeric(15,2))
    kembalian: Mapped[Optional[Decimal]] = mapped_column(Numeric(15,2))
    catatan: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    items: Mapped[List["TransaksiItem"]] = relationship(back_populates="transaksi", lazy="selectin")
    shift: Mapped[Optional[Shift]] = relationship(back_populates="transaksi")

class TransaksiItem(Base):
    __tablename__ = "transaksi_item"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaksi_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("transaksi.id"), nullable=False)
    produk_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("produk.id"), nullable=False)
    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    harga_satuan: Mapped[Decimal] = mapped_column(Numeric(15,2), nullable=False)
    diskon_per_item: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(15,2), nullable=False)

    transaksi: Mapped[Transaksi] = relationship(back_populates="items")

class VoidPin(Base):
    __tablename__ = "void_pins"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaksi_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("transaksi.id"), nullable=False)
    pin: Mapped[str] = mapped_column(String(6), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)

class CashPickup(Base):
    __tablename__ = "cash_pickups"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shift_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("shift.id"), nullable=False)
    jumlah: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    keterangan: Mapped[Optional[str]] = mapped_column(Text)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)