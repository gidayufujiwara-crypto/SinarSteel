from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
from datetime import date
from app.core.dependencies import get_db, require_role
from app.modules.finance import schemas
from app.modules.finance.service import FinanceService
from app.modules.auth.models import User
from app.modules.finance.models import ChartOfAccount
from sqlalchemy import select

router = APIRouter(prefix="/finance", tags=["Finance"])

@router.get("/journals", response_model=List[schemas.JournalEntryResponse])
async def list_journals(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await FinanceService.get_journal_list(db, start_date, end_date)

@router.post("/journals", response_model=schemas.JournalEntryResponse, status_code=201)
async def create_journal(
    data: schemas.JournalEntryCreate,
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await FinanceService.create_journal(db, data.model_dump(), current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profit-loss", response_model=List[schemas.ProfitLossItem])
async def profit_loss(
    bulan: int = Query(..., ge=1, le=12),
    tahun: int = Query(..., ge=2020),
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await FinanceService.get_profit_loss(db, bulan, tahun)

@router.post("/cash", response_model=schemas.CashResponse, status_code=201)
async def add_cash(
    data: schemas.CashCreate,
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await FinanceService.create_cash_transaction(db, data.model_dump(), current_user)

@router.get("/cash", response_model=List[schemas.CashResponse])
async def list_cash(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await FinanceService.get_cash_list(db, start_date, end_date)

@router.get("/coa", response_model=List[schemas.COAResponse])
async def list_coa(
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ChartOfAccount).order_by(ChartOfAccount.kode))
    return result.scalars().all()

@router.post("/coa", response_model=schemas.COAResponse, status_code=201)
async def create_coa(
    data: schemas.COACreate,
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(ChartOfAccount).where(ChartOfAccount.kode == data.kode))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Kode akun sudah ada")
    coa = ChartOfAccount(**data.model_dump())
    db.add(coa)
    await db.commit()
    await db.refresh(coa)
    return coa