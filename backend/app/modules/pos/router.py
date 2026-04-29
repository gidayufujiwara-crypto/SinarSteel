from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.pos import schemas
from app.modules.pos.service import ShiftService, TransaksiService
from app.modules.auth.models import User

router = APIRouter()

@router.get("/shift/current", response_model=schemas.ShiftResponse)
async def current_shift(
    current_user: User = Depends(require_role("super_admin", "manager", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    shift = await ShiftService.get_shift_aktif(db, current_user.id)
    if not shift:
        raise HTTPException(status_code=404, detail="Tidak ada shift aktif")
    return shift

@router.post("/shift/open", response_model=schemas.ShiftResponse)
async def open_shift(
    data: schemas.OpenShiftRequest,
    current_user: User = Depends(require_role("super_admin", "manager", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    return await ShiftService.buka_shift(db, current_user.id, data.saldo_awal)

@router.post("/shift/close", response_model=schemas.ShiftResponse)
async def close_shift(
    data: schemas.CloseShiftRequest,
    current_user: User = Depends(require_role("super_admin", "manager", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    shift = await ShiftService.tutup_shift(db, current_user.id, data.total_setoran)
    if not shift:
        raise HTTPException(status_code=400, detail="Tidak ada shift aktif")
    return shift

@router.get("/transaksi", response_model=List[schemas.TransaksiResponse])
async def list_transaksi(
    limit: int = 50,
    current_user: User = Depends(require_role("super_admin", "manager", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    return await TransaksiService.get_transaksi_list(db, kasir_id=current_user.id, limit=limit)

@router.get("/transaksi/{id}", response_model=schemas.TransaksiResponse)
async def get_transaksi(
    id: str,
    current_user: User = Depends(require_role("super_admin", "manager", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    trx = await TransaksiService.get_transaksi_by_id(db, id)
    if not trx:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    return trx

@router.post("/transaksi", response_model=schemas.TransaksiResponse, status_code=201)
async def create_transaksi(
    data: schemas.TransaksiCreate,
    current_user: User = Depends(require_role("super_admin", "manager", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    try:
        trx = await TransaksiService.create_transaksi(db, current_user, data.model_dump())
        return trx
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transaksi/{id}/void", response_model=schemas.TransaksiResponse)
async def void_transaksi(
    id: str,
    void_data: schemas.VoidRequest,
    current_user: User = Depends(require_role("super_admin", "manager")),
    db: AsyncSession = Depends(get_db)
):
    try:
        trx = await TransaksiService.void_transaksi(db, id, void_data.password, current_user)
        return trx
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))