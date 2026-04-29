import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Integer, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.core.base import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_order"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    no_po: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    supplier_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("supplier.id"), nullable=False)
    tanggal_order: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    tanggal_diterima: Mapped[datetime | None] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft/ordered/partial/received
    total: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    catatan: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_item"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    po_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("purchase_order.id"), nullable=False)
    produk_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("produk.id"), nullable=False)
    qty_order: Mapped[int] = mapped_column(Integer, nullable=False)
    qty_received: Mapped[int] = mapped_column(Integer, default=0)
    harga_satuan: Mapped[Decimal] = mapped_column(Numeric(15,2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(15,2), nullable=False)

class StockMutation(Base):
    __tablename__ = "stock_mutation"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    produk_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("produk.id"), nullable=False)
    tipe: Mapped[str] = mapped_column(String(20), nullable=False)  # masuk/keluar/opname_adjust
    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    referensi: Mapped[str | None] = mapped_column(String(100))  # e.g., "PO-xxx", "TRX-xxx"
    keterangan: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Rack(Base):
    __tablename__ = "rack"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kode: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nama: Mapped[str] = mapped_column(String(100))
    lokasi: Mapped[str | None] = mapped_column(String(200))

class StockOpname(Base):
    __tablename__ = "stock_opname"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tanggal: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    produk_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("produk.id"), nullable=False)
    qty_sistem: Mapped[int] = mapped_column(Integer, nullable=False)
    qty_fisik: Mapped[int] = mapped_column(Integer, nullable=False)
    selisih: Mapped[int] = mapped_column(Integer, nullable=False)
    keterangan: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)