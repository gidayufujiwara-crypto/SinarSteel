from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from uuid import UUID

# ==================== KATEGORI ====================
class KategoriCreate(BaseModel):
    nama: str = Field(..., min_length=1, max_length=100)
    deskripsi: Optional[str] = None

class KategoriUpdate(BaseModel):
    nama: Optional[str] = Field(None, min_length=1, max_length=100)
    deskripsi: Optional[str] = None

class KategoriResponse(BaseModel):
    id: UUID
    nama: str
    deskripsi: Optional[str]

    class Config:
        from_attributes = True

# ==================== SUPPLIER ====================
class SupplierCreate(BaseModel):
    kode: str = Field(..., min_length=1, max_length=20)
    nama: str = Field(..., max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)

class SupplierUpdate(BaseModel):
    kode: Optional[str] = Field(None, min_length=1, max_length=20)
    nama: Optional[str] = Field(None, max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)

class SupplierResponse(BaseModel):
    id: UUID
    kode: str
    nama: str
    alamat: Optional[str]
    telepon: Optional[str]
    email: Optional[str]

    class Config:
        from_attributes = True

# ==================== PELANGGAN ====================
class PelangganCreate(BaseModel):
    kode: str = Field(..., min_length=1, max_length=20)
    nama: str = Field(..., max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    limit_kredit: Optional[Decimal] = Field(0, max_digits=15, decimal_places=2)
    tipe: str = Field("umum", pattern="^(umum|kontraktor)$")

class PelangganUpdate(BaseModel):
    kode: Optional[str] = Field(None, min_length=1, max_length=20)
    nama: Optional[str] = Field(None, max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    limit_kredit: Optional[Decimal] = None
    tipe: Optional[str] = Field(None, pattern="^(umum|kontraktor)$")

class PelangganResponse(BaseModel):
    id: UUID
    kode: str
    nama: str
    alamat: Optional[str]
    telepon: Optional[str]
    email: Optional[str]
    limit_kredit: Optional[Decimal]
    saldo_kredit: Optional[Decimal]
    tipe: str

    class Config:
        from_attributes = True

# ==================== SATUAN ====================
class SatuanCreate(BaseModel):
    nama: str = Field(..., min_length=1, max_length=30)

class SatuanUpdate(BaseModel):
    nama: Optional[str] = Field(None, min_length=1, max_length=30)

class SatuanResponse(BaseModel):
    id: UUID
    nama: str

    class Config:
        from_attributes = True

# ==================== PRODUK ====================
class ProdukCreate(BaseModel):
    sku: str = Field(..., min_length=1, max_length=30)
    nama: str = Field(..., max_length=200)
    deskripsi: Optional[str] = None
    barcode: Optional[str] = Field(None, max_length=50)
    kategori_id: Optional[UUID] = None
    supplier_id: Optional[UUID] = None
    satuan_id: Optional[UUID] = None
    harga_beli: Decimal = Field(..., max_digits=15, decimal_places=2)
    harga_jual: Decimal = Field(..., max_digits=15, decimal_places=2)
    stok_minimum: int = Field(5, ge=0)
    is_active: bool = True

class ProdukUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=1, max_length=30)
    nama: Optional[str] = Field(None, max_length=200)
    deskripsi: Optional[str] = None
    barcode: Optional[str] = Field(None, max_length=50)
    kategori_id: Optional[UUID] = None
    supplier_id: Optional[UUID] = None
    satuan_id: Optional[UUID] = None
    harga_beli: Optional[Decimal] = None
    harga_jual: Optional[Decimal] = None
    stok_minimum: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class ProdukResponse(BaseModel):
    id: UUID
    sku: str
    nama: str
    deskripsi: Optional[str]
    barcode: Optional[str]
    kategori_id: Optional[UUID]
    supplier_id: Optional[UUID]
    satuan_id: Optional[UUID]
    harga_beli: Decimal
    harga_jual: Decimal
    hpp_rata_rata: Decimal   # ← BARU
    stok: int
    stok_minimum: int
    is_active: bool
    gambar_url: Optional[str]

    class Config:
        from_attributes = True