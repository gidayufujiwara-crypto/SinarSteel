import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, update, delete
from app.modules.master.models import Kategori, Supplier, Pelanggan, Satuan, Produk

# ---------- KATEGORI ----------
class KategoriService:
    @staticmethod
    async def get_all(db: AsyncSession) -> List[Kategori]:
        result = await db.execute(select(Kategori).order_by(Kategori.nama))
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[Kategori]:
        result = await db.execute(select(Kategori).where(Kategori.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: dict) -> Kategori:
        obj = Kategori(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def update(db: AsyncSession, id: uuid.UUID, data: dict) -> Optional[Kategori]:
        await db.execute(update(Kategori).where(Kategori.id == id).values(**data))
        await db.commit()
        return await KategoriService.get_by_id(db, id)

    @staticmethod
    async def delete(db: AsyncSession, id: uuid.UUID) -> bool:
        obj = await KategoriService.get_by_id(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

# ---------- SUPPLIER ----------
class SupplierService:
    @staticmethod
    async def get_all(db: AsyncSession, search: Optional[str] = None) -> List[Supplier]:
        stmt = select(Supplier)
        if search:
            stmt = stmt.where(or_(Supplier.nama.ilike(f"%{search}%"), Supplier.kode.ilike(f"%{search}%")))
        stmt = stmt.order_by(Supplier.nama)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[Supplier]:
        result = await db.execute(select(Supplier).where(Supplier.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: dict) -> Supplier:
        obj = Supplier(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def update(db: AsyncSession, id: uuid.UUID, data: dict) -> Optional[Supplier]:
        await db.execute(update(Supplier).where(Supplier.id == id).values(**data))
        await db.commit()
        return await SupplierService.get_by_id(db, id)

    @staticmethod
    async def delete(db: AsyncSession, id: uuid.UUID) -> bool:
        obj = await SupplierService.get_by_id(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

# ---------- PELANGGAN ----------
class PelangganService:
    @staticmethod
    async def get_all(db: AsyncSession, search: Optional[str] = None) -> List[Pelanggan]:
        stmt = select(Pelanggan)
        if search:
            stmt = stmt.where(or_(Pelanggan.nama.ilike(f"%{search}%"), Pelanggan.kode.ilike(f"%{search}%")))
        stmt = stmt.order_by(Pelanggan.nama)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[Pelanggan]:
        result = await db.execute(select(Pelanggan).where(Pelanggan.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: dict) -> Pelanggan:
        obj = Pelanggan(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def update(db: AsyncSession, id: uuid.UUID, data: dict) -> Optional[Pelanggan]:
        await db.execute(update(Pelanggan).where(Pelanggan.id == id).values(**data))
        await db.commit()
        return await PelangganService.get_by_id(db, id)

    @staticmethod
    async def delete(db: AsyncSession, id: uuid.UUID) -> bool:
        obj = await PelangganService.get_by_id(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

# ---------- SATUAN ----------
class SatuanService:
    @staticmethod
    async def get_all(db: AsyncSession) -> List[Satuan]:
        result = await db.execute(select(Satuan).order_by(Satuan.nama))
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[Satuan]:
        result = await db.execute(select(Satuan).where(Satuan.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: dict) -> Satuan:
        obj = Satuan(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def update(db: AsyncSession, id: uuid.UUID, data: dict) -> Optional[Satuan]:
        await db.execute(update(Satuan).where(Satuan.id == id).values(**data))
        await db.commit()
        return await SatuanService.get_by_id(db, id)

    @staticmethod
    async def delete(db: AsyncSession, id: uuid.UUID) -> bool:
        obj = await SatuanService.get_by_id(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True

# ---------- PRODUK ----------
class ProdukService:
    @staticmethod
    async def get_all(db: AsyncSession, search: Optional[str] = None) -> List[Produk]:
        stmt = select(Produk)
        if search:
            stmt = stmt.where(or_(Produk.nama.ilike(f"%{search}%"), Produk.sku.ilike(f"%{search}%"), Produk.barcode.ilike(f"%{search}%")))
        stmt = stmt.order_by(Produk.nama)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[Produk]:
        result = await db.execute(select(Produk).where(Produk.id == id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: dict) -> Produk:
        obj = Produk(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @staticmethod
    async def update(db: AsyncSession, id: uuid.UUID, data: dict) -> Optional[Produk]:
        await db.execute(update(Produk).where(Produk.id == id).values(**data))
        await db.commit()
        return await ProdukService.get_by_id(db, id)

    @staticmethod
    async def delete(db: AsyncSession, id: uuid.UUID) -> bool:
        obj = await ProdukService.get_by_id(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True