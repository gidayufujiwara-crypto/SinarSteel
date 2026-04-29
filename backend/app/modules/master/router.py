from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.master import schemas
from app.modules.master.service import (
    KategoriService, SupplierService, PelangganService, SatuanService, ProdukService
)
from app.modules.auth.models import User

router = APIRouter()

# ----------------------- KATEGORI -----------------------
@router.get("/kategori", response_model=List[schemas.KategoriResponse])
async def read_kategori(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager", "kasir", "gudang"))
):
    return await KategoriService.get_all(db)

@router.post("/kategori", response_model=schemas.KategoriResponse, status_code=201)
async def create_kategori(
    data: schemas.KategoriCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    return await KategoriService.create(db, data.model_dump())

@router.put("/kategori/{id}", response_model=schemas.KategoriResponse)
async def update_kategori(
    id: str,
    data: schemas.KategoriUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    obj = await KategoriService.get_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    return await KategoriService.update(db, id, data.model_dump(exclude_unset=True))

@router.delete("/kategori/{id}", status_code=204)
async def delete_kategori(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin"))  # hanya super_admin
):
    success = await KategoriService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")

# ----------------------- SUPPLIER -----------------------
@router.get("/supplier", response_model=List[schemas.SupplierResponse])
async def read_supplier(
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager", "gudang"))
):
    return await SupplierService.get_all(db, search)

@router.post("/supplier", response_model=schemas.SupplierResponse, status_code=201)
async def create_supplier(
    data: schemas.SupplierCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    return await SupplierService.create(db, data.model_dump())

@router.put("/supplier/{id}", response_model=schemas.SupplierResponse)
async def update_supplier(
    id: str,
    data: schemas.SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    obj = await SupplierService.get_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Supplier tidak ditemukan")
    return await SupplierService.update(db, id, data.model_dump(exclude_unset=True))

@router.delete("/supplier/{id}", status_code=204)
async def delete_supplier(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin"))
):
    success = await SupplierService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Supplier tidak ditemukan")

# ----------------------- PELANGGAN -----------------------
@router.get("/pelanggan", response_model=List[schemas.PelangganResponse])
async def read_pelanggan(
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager", "kasir"))
):
    return await PelangganService.get_all(db, search)

@router.post("/pelanggan", response_model=schemas.PelangganResponse, status_code=201)
async def create_pelanggan(
    data: schemas.PelangganCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    return await PelangganService.create(db, data.model_dump())

@router.put("/pelanggan/{id}", response_model=schemas.PelangganResponse)
async def update_pelanggan(
    id: str,
    data: schemas.PelangganUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    obj = await PelangganService.get_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Pelanggan tidak ditemukan")
    return await PelangganService.update(db, id, data.model_dump(exclude_unset=True))

@router.delete("/pelanggan/{id}", status_code=204)
async def delete_pelanggan(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin"))
):
    success = await PelangganService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Pelanggan tidak ditemukan")

# ----------------------- SATUAN -----------------------
@router.get("/satuan", response_model=List[schemas.SatuanResponse])
async def read_satuan(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager", "kasir", "gudang"))
):
    return await SatuanService.get_all(db)

@router.post("/satuan", response_model=schemas.SatuanResponse, status_code=201)
async def create_satuan(
    data: schemas.SatuanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    return await SatuanService.create(db, data.model_dump())

@router.put("/satuan/{id}", response_model=schemas.SatuanResponse)
async def update_satuan(
    id: str,
    data: schemas.SatuanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    obj = await SatuanService.get_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Satuan tidak ditemukan")
    return await SatuanService.update(db, id, data.model_dump(exclude_unset=True))

@router.delete("/satuan/{id}", status_code=204)
async def delete_satuan(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin"))
):
    success = await SatuanService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Satuan tidak ditemukan")

# ----------------------- PRODUK -----------------------
@router.get("/produk", response_model=List[schemas.ProdukResponse])
async def read_produk(
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager", "kasir", "gudang"))
):
    return await ProdukService.get_all(db, search)

@router.get("/produk/{id}", response_model=schemas.ProdukResponse)
async def read_produk_by_id(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager", "kasir", "gudang"))
):
    obj = await ProdukService.get_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    return obj

@router.post("/produk", response_model=schemas.ProdukResponse, status_code=201)
async def create_produk(
    data: schemas.ProdukCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    return await ProdukService.create(db, data.model_dump())

@router.put("/produk/{id}", response_model=schemas.ProdukResponse)
async def update_produk(
    id: str,
    data: schemas.ProdukUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "manager"))
):
    obj = await ProdukService.get_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    return await ProdukService.update(db, id, data.model_dump(exclude_unset=True))

@router.delete("/produk/{id}", status_code=204)
async def delete_produk(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin"))
):
    success = await ProdukService.delete(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")