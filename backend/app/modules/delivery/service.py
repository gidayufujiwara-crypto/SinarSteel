import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.delivery.models import DeliveryOrder, DeliveryStatusHistory
from app.modules.hr.models import Karyawan
from app.modules.auth.models import User

def generate_no_order():
    today = date.today().strftime("%Y%m%d")
    return f"DO-{today}-{uuid.uuid4().hex[:4].upper()}"

class DeliveryService:
    @staticmethod
    async def get_orders(db: AsyncSession, status: Optional[str] = None, driver_id: Optional[uuid.UUID] = None) -> List[DeliveryOrder]:
        stmt = select(DeliveryOrder).order_by(DeliveryOrder.created_at.desc())
        if status:
            stmt = stmt.where(DeliveryOrder.status == status)
        if driver_id:
            stmt = stmt.where(DeliveryOrder.driver_id == driver_id)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_order_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[DeliveryOrder]:
        result = await db.execute(select(DeliveryOrder).where(DeliveryOrder.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_order(db: AsyncSession, data: dict) -> DeliveryOrder:
        no_order = generate_no_order()
        order = DeliveryOrder(
            no_order=no_order,
            transaksi_id=data.get("transaksi_id"),
            pelanggan_id=data["pelanggan_id"],
            nama_penerima=data["nama_penerima"],
            alamat_pengiriman=data["alamat_pengiriman"],
            kota=data["kota"],
            telepon=data.get("telepon"),
            nominal_cod=data.get("nominal_cod"),
            status="disiapkan",
        )
        db.add(order)
        await db.commit()
        await db.refresh(order)
        return order

    @staticmethod
    async def assign_driver(db: AsyncSession, order_id: uuid.UUID, driver_id: uuid.UUID) -> Optional[DeliveryOrder]:
        order = await DeliveryService.get_order_by_id(db, order_id)
        if not order:
            return None
        # Verifikasi bahwa driver_id adalah karyawan yang ada (tidak wajib role driver)
        driver = await db.get(Karyawan, driver_id)
        if not driver:
            raise ValueError("Driver tidak ditemukan")
        order.driver_id = driver_id
        order.status = "diambil_driver" if order.status == "disiapkan" else order.status
        await db.commit()
        await db.refresh(order)
        return order

    @staticmethod
    async def update_status(db: AsyncSession, order_id: uuid.UUID, data: dict) -> Optional[DeliveryOrder]:
        order = await DeliveryService.get_order_by_id(db, order_id)
        if not order:
            return None
        new_status = data["status"]
        valid_status = ["disiapkan", "diambil_driver", "dalam_perjalanan", "sampai", "selesai"]
        if new_status not in valid_status:
            raise ValueError("Status tidak valid")

        history = DeliveryStatusHistory(
            delivery_id=order.id,
            status=new_status,
            catatan=data.get("catatan"),
            foto_url=data.get("foto_url"),
        )
        db.add(history)

        order.status = new_status
        if new_status == "selesai":
            order.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(order)
        return order

    @staticmethod
    async def get_driver_orders_today(db: AsyncSession, driver_id: uuid.UUID) -> List[DeliveryOrder]:
        today = date.today()
        stmt = select(DeliveryOrder).where(
            DeliveryOrder.driver_id == driver_id,
            DeliveryOrder.created_at >= today,
        ).order_by(DeliveryOrder.status != "selesai", DeliveryOrder.created_at)
        result = await db.execute(stmt)
        return result.scalars().all()
    
@staticmethod
async def confirm_cod(db: AsyncSession, order_id: uuid.UUID, data: dict, user: User) -> Optional[DeliveryOrder]:
    order = await DeliveryService.get_order_by_id(db, order_id)
    if not order:
        return None
    if order.status != "sampai":
        raise ValueError("COD hanya bisa dikonfirmasi saat status 'sampai'")
    # Simpan nominal COD yang diterima (bisa ditambahkan field di model, untuk sementara kita catat di catatan)
    order.catatan = f"COD diterima: {data['nominal_diterima']}"
    order.status = "selesai"
    # Tambah history
    history = DeliveryStatusHistory(
        delivery_id=order.id,
        status="selesai",
        catatan=order.catatan,
        foto_url=data.get("foto_url"),
    )
    db.add(history)
    await db.commit()
    await db.refresh(order)
    return order    

@staticmethod
async def get_driver_history(db: AsyncSession, driver_id: uuid.UUID) -> List[DeliveryOrder]:
    stmt = select(DeliveryOrder).where(
        DeliveryOrder.driver_id == driver_id,
        DeliveryOrder.status == "selesai"
    ).order_by(DeliveryOrder.updated_at.desc()).limit(50)
    result = await db.execute(stmt)
    return result.scalars().all()