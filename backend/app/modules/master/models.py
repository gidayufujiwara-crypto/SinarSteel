import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import String, Text, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.base import Base

class Kategori(Base):
    __tablename__ = "kategori"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nama: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    deskripsi: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    produk: Mapped[List["Produk"]] = relationship(back_populates="kategori")

class Supplier(Base):
    __tablename__ = "supplier"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kode: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nama: Mapped[str] = mapped_column(String(150), nullable=False)
    alamat: Mapped[Optional[str]] = mapped_column(Text)
    telepon: Mapped[Optional[str]] = mapped_column(String(20))
    email: Mapped[Optional[str]] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    produk: Mapped[List["Produk"]] = relationship(back_populates="supplier")

class Pelanggan(Base):
    __tablename__ = "pelanggan"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kode: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nama: Mapped[str] = mapped_column(String(150), nullable=False)
    alamat: Mapped[Optional[str]] = mapped_column(Text)
    telepon: Mapped[Optional[str]] = mapped_column(String(20))
    email: Mapped[Optional[str]] = mapped_column(String(100))
    limit_kredit: Mapped[Optional[Decimal]] = mapped_column(Numeric(15,2), default=0)
    saldo_kredit: Mapped[Optional[Decimal]] = mapped_column(Numeric(15,2), default=0)
    tipe: Mapped[str] = mapped_column(String(20), default="umum")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Satuan(Base):
    __tablename__ = "satuan"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nama: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)

    produk: Mapped[List["Produk"]] = relationship(back_populates="satuan")

class Produk(Base):
    __tablename__ = "produk"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    nama: Mapped[str] = mapped_column(String(200), nullable=False)
    deskripsi: Mapped[Optional[str]] = mapped_column(Text)
    barcode: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    kategori_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("kategori.id"))
    supplier_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("supplier.id"))
    satuan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("satuan.id"))
    harga_beli: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    harga_jual: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    stok: Mapped[int] = mapped_column(Integer, default=0)
    stok_minimum: Mapped[int] = mapped_column(Integer, default=5)
    is_active: Mapped[bool] = mapped_column(default=True)
    gambar_url: Mapped[Optional[str]] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    kategori: Mapped[Optional[Kategori]] = relationship(back_populates="produk")
    supplier: Mapped[Optional[Supplier]] = relationship(back_populates="produk")
    satuan: Mapped[Optional[Satuan]] = relationship(back_populates="produk")