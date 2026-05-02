from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal
from uuid import UUID
from datetime import date, datetime

# --- Chart of Account ---
class COACreate(BaseModel):
    kode: str
    nama: str
    tipe: str  # aset, liabilitas, ekuitas, pendapatan, beban
    saldo_normal: str  # debit / kredit

class COAResponse(BaseModel):
    id: UUID
    kode: str
    nama: str
    tipe: str
    saldo_normal: str
    is_active: bool
    class Config: from_attributes = True

# --- Journal Entry ---
class JournalItemCreate(BaseModel):
    account_id: UUID
    deskripsi: Optional[str] = None
    debit: Decimal = 0
    kredit: Decimal = 0

class JournalEntryCreate(BaseModel):
    tanggal: date
    keterangan: Optional[str] = None
    tipe: str  # penjualan, pembelian, kas, memorial
    items: List[JournalItemCreate]

class JournalEntryResponse(BaseModel):
    id: UUID
    no_jurnal: str
    tanggal: date
    keterangan: Optional[str]
    tipe: str
    created_at: datetime
    items: List["JournalItemResponse"] = []
    class Config: from_attributes = True

class JournalItemResponse(BaseModel):
    id: UUID
    account_id: UUID
    deskripsi: Optional[str]
    debit: Decimal
    kredit: Decimal
    class Config: from_attributes = True

# --- Invoice ---
class InvoiceCreate(BaseModel):
    tipe: str  # sale / purchase
    referensi_id: UUID
    supplier_id: Optional[UUID] = None
    pelanggan_id: Optional[UUID] = None
    total: Decimal
    jatuh_tempo: date

class InvoiceResponse(BaseModel):
    id: UUID
    no_invoice: str
    tanggal: date
    jatuh_tempo: date
    tipe: str
    total: Decimal
    sisa: Decimal
    status: str
    class Config: from_attributes = True

# --- Cash ---
class CashCreate(BaseModel):
    tanggal: date
    tipe: str  # pemasukan / pengeluaran
    kategori: str
    jumlah: Decimal
    keterangan: Optional[str] = None

class CashResponse(BaseModel):
    id: UUID
    tanggal: date
    tipe: str
    kategori: str
    jumlah: Decimal
    keterangan: Optional[str]
    created_at: datetime
    class Config: from_attributes = True

# --- Reports ---
class ProfitLossItem(BaseModel):
    nama_produk: Optional[str] = None
    total_pendapatan: Decimal = 0
    total_hpp: Decimal = 0
    laba_kotor: Decimal = 0