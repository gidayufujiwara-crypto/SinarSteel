from pydantic import BaseModel, Field, validator
from typing import List, Optional
from decimal import Decimal
from uuid import UUID
from datetime import datetime

class OpenShiftRequest(BaseModel):
    saldo_awal: Decimal = Field(0, ge=0)

class CloseShiftRequest(BaseModel):
    total_setoran: Decimal = Field(..., ge=0)

class ShiftResponse(BaseModel):
    id: UUID
    kasir_id: UUID
    waktu_buka: datetime
    waktu_tutup: Optional[datetime] = None
    total_transaksi: int
    total_tunai: Decimal
    total_transfer: Decimal
    total_qris: Decimal
    status: str
    saldo_awal: Decimal = 0
    catatan: Optional[str] = None

    class Config:
        from_attributes = True

class TransaksiItemCreate(BaseModel):
    produk_id: UUID
    qty: int = Field(..., gt=0)
    diskon_per_item: Decimal = Field(0, ge=0)

class TransaksiItemResponse(BaseModel):
    id: UUID
    produk_id: UUID
    qty: int
    harga_satuan: Decimal
    diskon_per_item: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True

class TransaksiCreate(BaseModel):
    pelanggan_id: Optional[UUID] = None
    jenis_pembayaran: str = Field(..., pattern="^(tunai|transfer|qris|kredit)$")
    items: List[TransaksiItemCreate]
    diskon_total: Decimal = Field(0, ge=0)
    bayar: Optional[Decimal] = None
    catatan: Optional[str] = None

class TransaksiResponse(BaseModel):
    id: UUID
    no_transaksi: str
    kasir_id: UUID
    pelanggan_id: Optional[UUID] = None
    shift_id: Optional[UUID] = None
    jenis_pembayaran: str
    status: str
    total_sebelum_diskon: Decimal
    diskon_total: Decimal
    total_setelah_diskon: Decimal
    bayar: Optional[Decimal] = None
    kembalian: Optional[Decimal] = None
    catatan: Optional[str] = None
    created_at: datetime
    items: List[TransaksiItemResponse] = []

    class Config:
        from_attributes = True

class VoidRequest(BaseModel):
    password: str

class RequestVoidResponse(BaseModel):
    transaksi_id: UUID
    pin: str

class VerifyVoidRequest(BaseModel):
    pin: str

class ReturRequest(BaseModel):
    transaksi_id: UUID
    items: List[TransaksiItemCreate]
    diskon_total: Decimal = Field(0, ge=0)