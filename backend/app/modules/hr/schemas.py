from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from datetime import date, time, datetime

# ---------- Karyawan ----------
class KaryawanCreate(BaseModel):
    nik: str = Field(..., min_length=1, max_length=20)
    nama: str = Field(..., max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = None
    tanggal_masuk: Optional[date] = None
    jabatan: Optional[str] = None
    gaji_pokok: Decimal = Field(0, max_digits=15, decimal_places=2)
    gaji_per_hari: Optional[Decimal] = None
    tipe_gaji: str = "bulanan"  # harian, mingguan, bulanan
    bpjs_tk: Optional[Decimal] = None
    bpjs_kes: Optional[Decimal] = None
    no_rek: Optional[str] = None
    bank: Optional[str] = None
    status_aktif: bool = True
    user_id: Optional[UUID] = None

class KaryawanUpdate(BaseModel):
    nik: Optional[str] = Field(None, min_length=1, max_length=20)
    nama: Optional[str] = Field(None, max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = None
    tanggal_masuk: Optional[date] = None
    jabatan: Optional[str] = None
    gaji_per_hari: Optional[Decimal] = None
    tipe_gaji: str = "bulanan"  # harian, mingguan, bulanan
    gaji_pokok: Optional[Decimal] = None
    bpjs_tk: Optional[Decimal] = None
    bpjs_kes: Optional[Decimal] = None
    no_rek: Optional[str] = None
    bank: Optional[str] = None
    status_aktif: Optional[bool] = None

class KaryawanResponse(BaseModel):
    id: UUID
    nik: str
    nama: str
    alamat: Optional[str]
    telepon: Optional[str]
    tanggal_masuk: Optional[date]
    jabatan: Optional[str]
    gaji_pokok: Decimal
    gaji_per_hari: Optional[Decimal] = None
    tipe_gaji: str = "bulanan"  # harian, mingguan, bulanan
    bpjs_tk: Optional[Decimal]
    bpjs_kes: Optional[Decimal]
    no_rek: Optional[str]
    bank: Optional[str]
    status_aktif: bool
    foto_url: Optional[str]
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# ---------- Jadwal Shift ----------
class JadwalShiftCreate(BaseModel):
    karyawan_id: UUID
    tanggal: date
    shift_ke: str = Field(..., pattern="^(pagi|sore|malam)$")
    jam_mulai: time
    jam_selesai: time

class JadwalShiftResponse(BaseModel):
    id: UUID
    karyawan_id: UUID
    tanggal: date
    shift_ke: str
    jam_mulai: time
    jam_selesai: time

    class Config:
        from_attributes = True

# ---------- Absensi ----------
class AbsensiCreate(BaseModel):
    tanggal: date
    jam_masuk: Optional[time] = None
    jam_pulang: Optional[time] = None
    lat_masuk: Optional[float] = None
    lon_masuk: Optional[float] = None
    lat_pulang: Optional[float] = None
    lon_pulang: Optional[float] = None
    foto_masuk_url: Optional[str] = None
    foto_pulang_url: Optional[str] = None
    status_hadir: str = "hadir"

class AbsensiUpdate(BaseModel):
    jam_pulang: Optional[time] = None
    lat_pulang: Optional[float] = None
    lon_pulang: Optional[float] = None
    foto_pulang_url: Optional[str] = None

class AbsensiResponse(BaseModel):
    id: UUID
    karyawan_id: UUID
    tanggal: date
    jam_masuk: Optional[time]
    jam_pulang: Optional[time]
    foto_masuk_url: Optional[str]
    foto_pulang_url: Optional[str]
    lat_masuk: Optional[float]
    lon_masuk: Optional[float]
    lat_pulang: Optional[float]
    lon_pulang: Optional[float]
    status_hadir: str

    class Config:
        from_attributes = True

# ---------- Penggajian ----------
class GajiResponse(BaseModel):
    id: UUID
    karyawan_id: UUID
    periode_bulan: int
    periode_tahun: int
    gaji_pokok: Decimal
    tunjangan: Decimal
    lembur_jam: int
    tarif_lembur: Decimal
    total_lembur: Decimal
    potongan: Decimal
    jam_lembur: int = 0
    tarif_lembur: Decimal = 0
    total_lembur: Decimal = 0
    total_gaji: Decimal

    class Config:
        from_attributes = True

class HitungGajiRequest(BaseModel):
    karyawan_id: UUID
    bulan: int = Field(..., ge=1, le=12)
    tahun: int = Field(..., ge=2020)
    jam_lembur: int = 0
    tarif_lembur: Decimal = 0