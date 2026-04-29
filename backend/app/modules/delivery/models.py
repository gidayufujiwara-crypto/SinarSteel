import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Integer, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.core.base import Base

class DeliveryOrder(Base):
    __tablename__ = "delivery_order"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    no_order: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    transaksi_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("transaksi.id"))
    pelanggan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pelanggan.id"), nullable=False)
    nama_penerima: Mapped[str] = mapped_column(String(150), nullable=False)
    alamat_pengiriman: Mapped[str] = mapped_column(Text, nullable=False)
    kota: Mapped[str] = mapped_column(String(100), nullable=False)
    telepon: Mapped[str | None] = mapped_column(String(20))
    nominal_cod: Mapped[Decimal | None] = mapped_column(Numeric(15,2))  # only if COD
    driver_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("karyawan.id"))
    status: Mapped[str] = mapped_column(String(20), default="disiapkan")  # disiapkan/diambil_driver/dalam_perjalanan/sampai/selesai
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DeliveryStatusHistory(Base):
    __tablename__ = "delivery_status_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    delivery_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("delivery_order.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    catatan: Mapped[str | None] = mapped_column(Text)
    foto_url: Mapped[str | None] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)