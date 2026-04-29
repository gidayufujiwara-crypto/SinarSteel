from typing import Optional
import uuid
from datetime import datetime, date, time
from decimal import Decimal

from sqlalchemy import String, Integer, Numeric, ForeignKey, Date, Time, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.core.base import Base

class Karyawan(Base):
    __tablename__ = "karyawan"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nik: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nama: Mapped[str] = mapped_column(String(150), nullable=False)
    alamat: Mapped[str | None] = mapped_column(Text)
    telepon: Mapped[str | None] = mapped_column(String(20))
    tanggal_masuk: Mapped[date | None] = mapped_column(Date)
    jabatan: Mapped[str | None] = mapped_column(String(100))
    gaji_pokok: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    bpjs_tk: Mapped[Decimal | None] = mapped_column(Numeric(15,2), default=0)
    bpjs_kes: Mapped[Decimal | None] = mapped_column(Numeric(15,2), default=0)
    no_rek: Mapped[str | None] = mapped_column(String(30))
    bank: Mapped[str | None] = mapped_column(String(50))
    status_aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    foto_url: Mapped[str | None] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    

class JadwalShift(Base):
    __tablename__ = "jadwal_shift"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    karyawan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("karyawan.id"), nullable=False)
    tanggal: Mapped[date] = mapped_column(Date, nullable=False)
    shift_ke: Mapped[str] = mapped_column(String(10), nullable=False)  # pagi/sore/malam
    jam_mulai: Mapped[time] = mapped_column(Time, nullable=False)
    jam_selesai: Mapped[time] = mapped_column(Time, nullable=False)

class Absensi(Base):
    __tablename__ = "absensi"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    karyawan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("karyawan.id"), nullable=False)
    tanggal: Mapped[date] = mapped_column(Date, nullable=False)
    jam_masuk: Mapped[time | None] = mapped_column(Time)
    jam_pulang: Mapped[time | None] = mapped_column(Time)
    foto_masuk_url: Mapped[str | None] = mapped_column(String(300))
    foto_pulang_url: Mapped[str | None] = mapped_column(String(300))
    lat_masuk: Mapped[float | None] = mapped_column()
    lon_masuk: Mapped[float | None] = mapped_column()
    lat_pulang: Mapped[float | None] = mapped_column()
    lon_pulang: Mapped[float | None] = mapped_column()
    status_hadir: Mapped[str] = mapped_column(String(20), default="hadir")  # hadir/terlambat/tidak_hadir/lembur
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Gaji(Base):
    __tablename__ = "gaji"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    karyawan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("karyawan.id"), nullable=False)
    periode_bulan: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-12
    periode_tahun: Mapped[int] = mapped_column(Integer, nullable=False)
    gaji_pokok: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    tunjangan: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    lembur_jam: Mapped[int] = mapped_column(Integer, default=0)
    tarif_lembur: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    total_lembur: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    potongan: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    bpjs_tk: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    bpjs_kes: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    total_gaji: Mapped[Decimal] = mapped_column(Numeric(15,2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)