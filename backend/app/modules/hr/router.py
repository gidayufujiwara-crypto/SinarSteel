from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date, timedelta

from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.hr import schemas
from app.modules.hr.service import HrService
from app.modules.hr.models import Karyawan, Absensi
from app.modules.auth.models import User

router = APIRouter()

# ---------- KARYAWAN ----------
@router.get("/karyawan", response_model=List[schemas.KaryawanResponse])
async def list_karyawan(
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await HrService.get_karyawan_list(db)

@router.post("/karyawan", response_model=schemas.KaryawanResponse, status_code=201)
async def create_karyawan(
    data: schemas.KaryawanCreate,
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await HrService.create_karyawan(db, data.model_dump())

@router.put("/karyawan/{id}", response_model=schemas.KaryawanResponse)
async def update_karyawan(
    id: UUID,
    data: schemas.KaryawanUpdate,
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    obj = await HrService.get_karyawan_by_id(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")
    return await HrService.update_karyawan(db, id, data.model_dump(exclude_unset=True))

@router.delete("/karyawan/{id}", status_code=204)
async def delete_karyawan(
    id: UUID,
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    success = await HrService.delete_karyawan(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")

# ---------- JADWAL SHIFT ----------
@router.get("/jadwal/{karyawan_id}", response_model=List[schemas.JadwalShiftResponse])
async def get_jadwal(
    karyawan_id: UUID,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin", "karyawan")),
    db: AsyncSession = Depends(get_db)
):
    return await HrService.get_jadwal_by_karyawan(db, karyawan_id, start_date, end_date)

@router.post("/jadwal", response_model=schemas.JadwalShiftResponse, status_code=201)
async def create_jadwal(
    data: schemas.JadwalShiftCreate,
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await HrService.create_jadwal(db, data.model_dump())

# ---------- ABSENSI ----------
@router.get("/absensi/{karyawan_id}", response_model=List[schemas.AbsensiResponse])
async def list_absensi(
    karyawan_id: UUID,
    bulan: Optional[int] = Query(None),
    tahun: Optional[int] = Query(None),
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin", "karyawan")),
    db: AsyncSession = Depends(get_db)
):
    return await HrService.get_absensi_by_karyawan(db, karyawan_id, bulan, tahun)

@router.post("/absensi/{karyawan_id}", response_model=schemas.AbsensiResponse, status_code=201)
async def create_absensi(
    karyawan_id: UUID,
    data: schemas.AbsensiCreate,
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin", "karyawan")),
    db: AsyncSession = Depends(get_db)
):
    return await HrService.create_absensi(db, {**data.model_dump(), "karyawan_id": karyawan_id})

@router.put("/absensi/{karyawan_id}/{tanggal}", response_model=schemas.AbsensiResponse)
async def update_absensi_pulang(
    karyawan_id: UUID,
    tanggal: date,
    data: schemas.AbsensiUpdate,
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin", "karyawan")),
    db: AsyncSession = Depends(get_db)
):
    # Cari absensi berdasarkan karyawan_id dan tanggal
    result = await db.execute(
        select(Absensi).where(
            Absensi.karyawan_id == karyawan_id,
            Absensi.tanggal == tanggal
        )
    )
    absensi = result.scalar_one_or_none()
    if not absensi:
        raise HTTPException(status_code=404, detail="Absensi tidak ditemukan")

    # Update data pulang
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(absensi, key, value)

    await db.commit()
    await db.refresh(absensi)
    return absensi

# ---------- GAJI ----------
@router.post("/gaji/hitung", response_model=schemas.GajiResponse)
async def hitung_gaji(
    data: schemas.HitungGajiRequest,
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await HrService.hitung_gaji(db, data.karyawan_id, data.bulan, data.tahun)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/gaji", response_model=List[schemas.GajiResponse])
async def list_gaji(
    bulan: Optional[int] = Query(None),
    tahun: Optional[int] = Query(None),
    current_user: User = Depends(require_role("super_admin", "manager", "hr_admin", "karyawan")),
    db: AsyncSession = Depends(get_db)
):
    return await HrService.get_gaji_list(db, bulan, tahun)

# ---------- ME (karyawan terhubung) ----------
@router.get("/me", response_model=schemas.KaryawanResponse)
async def read_my_karyawan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Karyawan).where(Karyawan.user_id == current_user.id)
    )
    karyawan = result.scalar_one_or_none()
    if not karyawan:
        raise HTTPException(status_code=404, detail="Data karyawan tidak ditemukan")
    return karyawan

# ---------- Jadwal shift untuk mobile (my jadwal) ----------
@router.get("/jadwal/mobile", response_model=List[schemas.JadwalShiftResponse])
async def get_my_jadwal(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Karyawan).where(Karyawan.user_id == current_user.id))
    karyawan = result.scalar_one_or_none()
    if not karyawan:
        raise HTTPException(status_code=404, detail="Data karyawan tidak ditemukan")
    return await HrService.get_jadwal_by_karyawan(db, karyawan.id, date.today(), date.today() + timedelta(days=30))