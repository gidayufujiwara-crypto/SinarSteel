from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.wms import schemas
from app.modules.wms.service import WmsService
from app.modules.auth.models import User
from uuid import UUID

router = APIRouter()

# ---------- Purchase Order ----------
@router.get("/po", response_model=List[schemas.POResponse])
async def list_po(
    status: Optional[str] = Query(None),
    current_user: User = Depends(require_role("super_admin", "manager", "gudang")),
    db: AsyncSession = Depends(get_db),
):
    return await WmsService.get_po_list(db, status)

@router.get("/po/{id}", response_model=schemas.POResponse)
async def get_po(
    id: str,
    current_user: User = Depends(require_role("super_admin", "manager", "gudang")),
    db: AsyncSession = Depends(get_db),
):
    po = await WmsService.get_po_by_id(db, id)
    if not po:
        raise HTTPException(status_code=404, detail="PO tidak ditemukan")
    return po

@router.post("/po", response_model=schemas.POResponse, status_code=201)
async def create_po(
    data: schemas.POCreate,
    current_user: User = Depends(require_role("super_admin", "manager", "gudang")),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await WmsService.create_po(db, data.model_dump(), current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/po/{id}/status", response_model=schemas.POResponse)
async def update_po_status(
    id: str,
    status: str = Query(..., description="draft/ordered/partial/received"),
    current_user: User = Depends(require_role("super_admin", "manager", "gudang")),
    db: AsyncSession = Depends(get_db),
):
    po = await WmsService.update_po_status(db, id, status)
    if not po:
        raise HTTPException(status_code=404, detail="PO tidak ditemukan")
    return po

@router.post("/po/{id}/receive", response_model=schemas.POResponse)
async def receive_po(
    id: str,
    data: schemas.POReceive,
    current_user: User = Depends(require_role("super_admin", "manager", "gudang")),
    db: AsyncSession = Depends(get_db),
):
    try:
        po = await WmsService.receive_po(db, id, data.model_dump(), current_user)
        return po
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------- Stock Opname ----------
@router.get("/opname", response_model=List[schemas.StockOpnameResponse])
async def list_opname(
    current_user: User = Depends(require_role("super_admin", "manager", "gudang")),
    db: AsyncSession = Depends(get_db),
):
    return await WmsService.get_stock_opname_list(db)

@router.post("/opname", response_model=List[schemas.StockOpnameResponse], status_code=201)
async def create_opname(
    data: schemas.SOCreate,
    current_user: User = Depends(require_role("super_admin", "manager", "gudang")),
    db: AsyncSession = Depends(get_db),
):
    return await WmsService.create_stock_opname(db, data.model_dump(), current_user)

# ---------- Mutation History ----------
@router.get("/mutation", response_model=List[schemas.StockMutationResponse])
async def list_mutations(
    produk_id: Optional[str] = Query(None),
    current_user: User = Depends(require_role("super_admin", "manager", "gudang", "kasir")),
    db: AsyncSession = Depends(get_db),
):
    return await WmsService.get_mutations(db, produk_id=UUID(produk_id) if produk_id else None)

# ---------- Inventory (stok) ----------
@router.get("/inventory", response_model=List[schemas.InventoryProduct])
async def list_inventory(
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_role("super_admin", "manager", "gudang", "kasir")),
    db: AsyncSession = Depends(get_db),
):
    return await WmsService.get_inventory(db, search)