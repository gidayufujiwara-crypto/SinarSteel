from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import date
from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.pos import schemas
from app.modules.pos.service import TransaksiService, ShiftService, VoidService, ReturService
from app.modules.pos.models import Transaksi
from app.modules.auth.models import User

router = APIRouter()

@router.get("/shift/current", response_model=schemas.ShiftResponse)
async def current_shift(
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    shift = await ShiftService.get_shift_aktif(db, current_user.id)
    if not shift:
        raise HTTPException(status_code=404, detail="Tidak ada shift aktif")
    return shift

@router.post("/shift/open", response_model=schemas.ShiftResponse)
async def open_shift(
    data: schemas.OpenShiftRequest,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    return await ShiftService.buka_shift(db, current_user.id, data.saldo_awal)

@router.post("/shift/close", response_model=schemas.ShiftResponse)
async def close_shift(
    data: schemas.CloseShiftRequest,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    shift = await ShiftService.tutup_shift(db, current_user.id, data.total_setoran)
    if not shift:
        raise HTTPException(status_code=400, detail="Tidak ada shift aktif")
    return shift

@router.get("/transaksi", response_model=List[schemas.TransaksiResponse])
async def list_transaksi(
    limit: int = 100,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaksi).where(func.date(Transaksi.created_at) == date.today())
        .order_by(Transaksi.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/transaksi", response_model=schemas.TransaksiResponse, status_code=201)
async def create_transaksi(
    data: schemas.TransaksiCreate,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await TransaksiService.create_transaksi(db, current_user, data.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transaksi/{id}/request-void", response_model=schemas.RequestVoidResponse)
async def request_void(
    id: UUID,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    try:
        pin = await VoidService.request_void(db, id, current_user)
        return {"transaksi_id": id, "pin": pin}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transaksi/{id}/verify-void", response_model=schemas.TransaksiResponse)
async def verify_void(
    id: UUID,
    data: schemas.VerifyVoidRequest,
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await VoidService.verify_void(db, id, data.pin, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/retur", response_model=schemas.TransaksiResponse, status_code=201)
async def retur_transaksi(
    data: schemas.ReturRequest,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await ReturService.retur_transaksi(db, data.model_dump(), current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/transaksi/{id}/switch-payment", response_model=schemas.TransaksiResponse)
async def switch_payment(
    id: UUID,
    data: schemas.SwitchPaymentRequest,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    trx = await TransaksiService.get_transaksi_by_id(db, id)
    if not trx:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    if trx.jenis_pembayaran != "cod":
        raise HTTPException(status_code=400, detail="Hanya transaksi COD yang dapat diubah")
    # Cek apakah ada delivery order terkait dengan status sampai
    trx.jenis_pembayaran = data.jenis_pembayaran
    await db.commit()
    await db.refresh(trx)
    return trx

@router.get("/shift/collection", response_model=schemas.ShiftCollectionResponse)
async def get_shift_collection(
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    shift = await ShiftService.get_shift_aktif(db, current_user.id)
    if not shift:
        raise HTTPException(status_code=404, detail="Tidak ada shift aktif")
    return await ShiftService.get_shift_collection(db, shift.id)

@router.post("/shift/pickup", response_model=schemas.PickupResponse)
async def create_pickup(
    data: schemas.PickupCreate,
    current_user: User = Depends(require_role("super_admin", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    shift = await ShiftService.get_shift_aktif(db, current_user.id)
    if not shift:
        raise HTTPException(status_code=404, detail="Tidak ada shift aktif")
    return await ShiftService.create_pickup(db, shift.id, data.model_dump(), current_user.id)