from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from datetime import datetime

# ---------- Delivery Order ----------
class DeliveryOrderCreate(BaseModel):
    transaksi_id: Optional[UUID] = None
    pelanggan_id: UUID
    nama_penerima: str = Field(..., max_length=150)
    alamat_pengiriman: str
    kota: str = Field(..., max_length=100)
    telepon: Optional[str] = None
    nominal_cod: Optional[Decimal] = None

class DeliveryOrderUpdate(BaseModel):
    driver_id: Optional[UUID] = None
    status: Optional[str] = None

class DeliveryOrderResponse(BaseModel):
    id: UUID
    no_order: str
    transaksi_id: Optional[UUID] = None
    pelanggan_id: Optional[UUID] = None
    nama_penerima: str
    alamat_pengiriman: str
    kota: str
    telepon: Optional[str] = None
    nominal_cod: Optional[Decimal] = None
    driver_id: Optional[UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CODConfirmRequest(BaseModel):
    nominal_diterima: Decimal
    foto_url: Optional[str] = None

# ---------- Status History ----------
class StatusUpdateRequest(BaseModel):
    status: str
    catatan: Optional[str] = None
    foto_url: Optional[str] = None

class StatusHistoryResponse(BaseModel):
    id: UUID
    delivery_id: UUID
    status: str
    catatan: Optional[str] = None
    foto_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True