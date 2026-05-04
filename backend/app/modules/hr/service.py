import uuid
from datetime import date, datetime, timedelta
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.modules.hr.models import Karyawan, JadwalShift, Absensi, Gaji
from app.modules.auth.models import User

class HrService:
    @staticmethod
    async def get_karyawan_list(db: AsyncSession) -> List[Karyawan]:
        result = await db.execute(select(Karyawan).order_by(Karyawan.nama))
        return result.scalars().all()

    @staticmethod
    async def get_karyawan_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[Karyawan]:
        result = await db.execute(select(Karyawan).where(Karyawan.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_karyawan(db: AsyncSession, data: dict) -> Karyawan:
        obj = Karyawan(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def update_karyawan(db: AsyncSession, id: uuid.UUID, data: dict) -> Optional[Karyawan]:
        await db.execute(update(Karyawan).where(Karyawan.id == id).values(**data))
        await db.commit()
        return await HrService.get_karyawan_by_id(db, id)

    @staticmethod
    async def delete_karyawan(db: AsyncSession, id: uuid.UUID) -> bool:
        obj = await HrService.get_karyawan_by_id(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

    @staticmethod
    async def get_jadwal_by_karyawan(db: AsyncSession, karyawan_id: uuid.UUID, start_date: date, end_date: date) -> List[JadwalShift]:
        result = await db.execute(
            select(JadwalShift).where(
                JadwalShift.karyawan_id == karyawan_id,
                JadwalShift.tanggal >= start_date,
                JadwalShift.tanggal <= end_date
            ).order_by(JadwalShift.tanggal)
        )
        return result.scalars().all()

    @staticmethod
    async def create_jadwal(db: AsyncSession, data: dict) -> JadwalShift:
        obj = JadwalShift(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def get_absensi_by_karyawan(db: AsyncSession, karyawan_id: uuid.UUID, range_bulan: Optional[int] = None, range_tahun: Optional[int] = None) -> List[Absensi]:
        stmt = select(Absensi).where(Absensi.karyawan_id == karyawan_id)
        if range_bulan and range_tahun:
            stmt = stmt.where(
                func.extract('month', Absensi.tanggal) == range_bulan,
                func.extract('year', Absensi.tanggal) == range_tahun
            )
        stmt = stmt.order_by(Absensi.tanggal.desc())
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def create_absensi(db: AsyncSession, data: dict) -> Absensi:
        obj = Absensi(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def hitung_gaji(db: AsyncSession, karyawan_id: uuid.UUID, bulan: int, tahun: int) -> Gaji:
        karyawan = await HrService.get_karyawan_by_id(db, karyawan_id)
        if not karyawan:
            raise ValueError("Karyawan tidak ditemukan")

        # Ambil absensi bulan tersebut
        absensi_list = await HrService.get_absensi_by_karyawan(db, karyawan_id, bulan, tahun)

        # Hitung total jam lembur
        total_jam_lembur = 0
        for absen in absensi_list:
            if absen.jam_masuk and absen.jam_pulang:
                masuk = datetime.combine(date.today(), absen.jam_masuk)
                pulang = datetime.combine(date.today(), absen.jam_pulang)
                selisih = (pulang - masuk).total_seconds() / 3600
                if selisih > 8:  # lebih dari 8 jam normal
                    total_jam_lembur += selisih - 8

    # Hitung gaji berdasarkan tipe
    gaji_pokok = 0
    if karyawan.tipe_gaji == "bulanan":
        gaji_pokok = karyawan.gaji_pokok
    elif karyawan.tipe_gaji == "harian":
        hari_masuk = len([a for a in absensi_list if a.status_hadir in ("hadir", "terlambat")])
        gaji_pokok = (karyawan.gaji_per_hari or 0) * hari_masuk
    elif karyawan.tipe_gaji == "mingguan":
        # Hitung jumlah minggu dalam bulan
        import calendar
        _, num_days = calendar.monthrange(tahun, bulan)
        minggu = (num_days + date(tahun, bulan, 1).weekday()) // 7 + 1
        gaji_pokok = (karyawan.gaji_per_hari or 0) * 7 * minggu

    tarif_lembur = (gaji_pokok / 173) * 1.5  # asumsi tarif lembur 1.5x per jam
    total_lembur = Decimal(total_jam_lembur) * tarif_lembur
    total_gaji = gaji_pokok + total_lembur

    gaji = Gaji(
        karyawan_id=karyawan_id,
        periode_bulan=bulan,
        periode_tahun=tahun,
        gaji_pokok=gaji_pokok,
        tunjangan=Decimal(0),
        lembur_jam=int(total_jam_lembur),
        tarif_lembur=tarif_lembur,
        total_lembur=total_lembur,
        potongan=Decimal(0),
        bpjs_tk=Decimal(0),
        bpjs_kes=Decimal(0),
        total_gaji=total_gaji,
    )
    db.add(gaji)
    await db.commit()
    await db.refresh(gaji)
    return gaji

    @staticmethod
    async def get_gaji_list(db: AsyncSession, bulan: Optional[int] = None, tahun: Optional[int] = None) -> List[Gaji]:
        stmt = select(Gaji)
        if bulan is not None and tahun is not None:
            stmt = stmt.where(Gaji.periode_bulan == bulan, Gaji.periode_tahun == tahun)
        stmt = stmt.order_by(Gaji.periode_tahun.desc(), Gaji.periode_bulan.desc())
        result = await db.execute(stmt)
        return result.scalars().all()