from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal
from uuid import UUID
from datetime import datetime

# ---------- Purchase Order ----------
class POItemCreate(BaseModel):
    produk_id: UUID
    qty_order: int = Field(..., gt=0)
    harga_satuan: Decimal = Field(..., gt=0)

class POItemResponse(BaseModel):
    id: UUID
    produk_id: UUID
    qty_order: int
    qty_received: int
    harga_satuan: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True

class POCreate(BaseModel):
    supplier_id: UUID
    items: List[POItemCreate]
    catatan: Optional[str] = None

class POResponse(BaseModel):
    id: UUID
    no_po: str
    supplier_id: UUID
    status: str
    total: Decimal
    tanggal_order: datetime
    tanggal_diterima: Optional[datetime] = None
    catatan: Optional[str] = None
    created_by: UUID

    class Config:
        from_attributes = True

class POReceiveItem(BaseModel):
    item_id: UUID
    qty_received: int = Field(..., gt=0)

class POReceive(BaseModel):
    items: List[POReceiveItem]

# ---------- Stock Opname ----------
class SOItemCreate(BaseModel):
    produk_id: UUID
    qty_fisik: int

class SOCreate(BaseModel):
    items: List[SOItemCreate]
    keterangan: Optional[str] = None

class StockOpnameResponse(BaseModel):
    id: UUID
    tanggal: datetime
    produk_id: UUID
    qty_sistem: int
    qty_fisik: int
    selisih: int
    keterangan: Optional[str] = None
    created_by: UUID

    class Config:
        from_attributes = True

# ---------- Stock Mutation ----------
class StockMutationResponse(BaseModel):
    id: UUID
    produk_id: UUID
    tipe: str
    qty: int
    referensi: Optional[str] = None
    keterangan: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Inventory Summary ----------
class InventoryProduct(BaseModel):
    id: UUID
    sku: str
    nama: str
    stok: int
    stok_minimum: int
    harga_jual: Decimal
    is_active: bool

    class Config:
        from_attributes = True