import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.modules.pos.models import Shift, Transaksi, TransaksiItem
from app.modules.master.models import Produk, Pelanggan
from app.modules.auth.models import User
from app.core.security import verify_password

class ShiftService:
    @staticmethod
    async def get_shift_aktif(db: AsyncSession, kasir_id: uuid.UUID) -> Optional[Shift]:
        result = await db.execute(
            select(Shift).where(Shift.kasir_id == kasir_id, Shift.status == "buka")
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def buka_shift(db: AsyncSession, kasir_id: uuid.UUID, saldo_awal: Decimal = Decimal(0)) -> Shift:
        shift_aktif = await ShiftService.get_shift_aktif(db, kasir_id)
        if shift_aktif:
            return shift_aktif
        shift = Shift(kasir_id=kasir_id, status="buka", saldo_awal=saldo_awal)
        db.add(shift)
        await db.commit()
        await db.refresh(shift)
        return shift

    @staticmethod
    async def tutup_shift(db: AsyncSession, kasir_id: uuid.UUID, total_setoran: Decimal) -> Optional[Shift]:
        shift = await ShiftService.get_shift_aktif(db, kasir_id)
        if not shift:
            return None

        # Hitung total transaksi
        rekap = await db.execute(
            select(
                func.count(Transaksi.id).label("total_trx"),
                func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0).label("total_penjualan")
            ).where(Transaksi.shift_id == shift.id, Transaksi.status == "selesai")
        )
        data = rekap.one()
        total_transaksi = data.total_trx or 0
        total_penjualan = data.total_penjualan or Decimal(0)

        # Total tunai khusus
        result_tunai = await db.execute(
            select(func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0))
            .where(Transaksi.shift_id == shift.id, Transaksi.status == "selesai", Transaksi.jenis_pembayaran == "tunai")
        )
        total_tunai = result_tunai.scalar() or Decimal(0)

        # Kalkulasi
        seharusnya = shift.saldo_awal + total_penjualan
        selisih = total_setoran - seharusnya

        shift.waktu_tutup = datetime.utcnow()
        shift.total_transaksi = total_transaksi
        shift.total_tunai = total_tunai
        shift.total_transfer = Decimal(0)  # bisa dihitung, tapi untuk sederhana 0
        shift.total_qris = Decimal(0)
        shift.status = "tutup"
        shift.catatan = f"Setoran: {total_setoran}, Seharusnya: {seharusnya}, Selisih: {selisih}"

        await db.commit()
        await db.refresh(shift)
        return shift

class TransaksiService:
    @staticmethod
    async def generate_no_transaksi(db: AsyncSession) -> str:
        today = date.today().strftime("%Y%m%d")
        result = await db.execute(
            select(Transaksi.no_transaksi).where(
                Transaksi.no_transaksi.like(f"TRX-{today}-%")
            ).order_by(Transaksi.no_transaksi.desc()).limit(1)
        )
        last = result.scalar_one_or_none()
        if last:
            num = int(last.split("-")[-1]) + 1
        else:
            num = 1
        return f"TRX-{today}-{num:04d}"

    @staticmethod
    async def create_transaksi(
        db: AsyncSession,
        kasir: User,
        data: dict,
    ) -> Transaksi:
        no_trx = await TransaksiService.generate_no_transaksi(db)

        shift = await ShiftService.get_shift_aktif(db, kasir.id)
        if not shift:
            raise ValueError("Shift belum dibuka")

        items_data = data.get("items", [])
        total_sebelum = Decimal(0)
        item_list = []
        for item in items_data:
            produk = await db.get(Produk, item["produk_id"])
            if not produk or not produk.is_active:
                raise ValueError(f"Produk {item['produk_id']} tidak ditemukan/tidak aktif")
            if produk.stok < item["qty"]:
                raise ValueError(f"Stok produk {produk.nama} tidak mencukupi")
            harga = produk.harga_jual
            diskon = item.get("diskon_per_item", 0)
            subtotal = (harga - diskon) * item["qty"]
            total_sebelum += subtotal
            item_list.append({
                "produk_id": item["produk_id"],
                "qty": item["qty"],
                "harga_satuan": harga,
                "diskon_per_item": diskon,
                "subtotal": subtotal,
            })
            produk.stok -= item["qty"]

        diskon_total = data.get("diskon_total", 0)
        total_setelah = total_sebelum - diskon_total
        if total_setelah < 0:
            raise ValueError("Total tidak boleh negatif")

        jenis = data.get("jenis_pembayaran")
        bayar = data.get("bayar")
        kembalian = None

        if jenis == "kredit":
            if not data.get("pelanggan_id"):
                raise ValueError("Pelanggan harus dipilih untuk kredit")
            pelanggan = await db.get(Pelanggan, data["pelanggan_id"])
            if not pelanggan:
                raise ValueError("Pelanggan tidak ditemukan")
            sisa_limit = (pelanggan.limit_kredit or 0) - (pelanggan.saldo_kredit or 0)
            if total_setelah > sisa_limit:
                raise ValueError("Limit kredit pelanggan tidak mencukupi")
            pelanggan.saldo_kredit = (pelanggan.saldo_kredit or 0) + total_setelah
            bayar = None
            kembalian = None
        elif jenis == "tunai":
            if bayar is None or bayar < total_setelah:
                raise ValueError("Jumlah bayar kurang")
            kembalian = bayar - total_setelah
        else:
            bayar = total_setelah
            kembalian = Decimal(0)

        transaksi = Transaksi(
            no_transaksi=no_trx,
            kasir_id=kasir.id,
            pelanggan_id=data.get("pelanggan_id"),
            shift_id=shift.id,
            jenis_pembayaran=jenis,
            status="selesai" if jenis != "kredit" else "kredit",
            total_sebelum_diskon=total_sebelum,
            diskon_total=diskon_total,
            total_setelah_diskon=total_setelah,
            bayar=bayar,
            kembalian=kembalian,
            catatan=data.get("catatan"),
        )
        db.add(transaksi)
        await db.flush()

        for item in item_list:
            ti = TransaksiItem(
                transaksi_id=transaksi.id,
                produk_id=item["produk_id"],
                qty=item["qty"],
                harga_satuan=item["harga_satuan"],
                diskon_per_item=item["diskon_per_item"],
                subtotal=item["subtotal"],
            )
            db.add(ti)

        await db.commit()
        await db.refresh(transaksi)
        return transaksi

    @staticmethod
    async def void_transaksi(db: AsyncSession, transaksi_id: uuid.UUID, password: str, current_user: User) -> Transaksi:
        result = await db.execute(
            select(Transaksi).where(Transaksi.id == transaksi_id)
        )
        transaksi = result.scalar_one_or_none()
        if not transaksi:
            raise ValueError("Transaksi tidak ditemukan")
        if transaksi.status == "void":
            raise ValueError("Transaksi sudah di-void")

        if not verify_password(password, current_user.password_hash):
            raise ValueError("Password otorisasi salah")
        if current_user.role not in ("super_admin", "manager"):
            raise ValueError("Anda tidak memiliki wewenang untuk void transaksi")

        for item in transaksi.items:
            produk = await db.get(Produk, item.produk_id)
            if produk:
                produk.stok += item.qty

        if transaksi.jenis_pembayaran == "kredit" and transaksi.pelanggan_id:
            pelanggan = await db.get(Pelanggan, transaksi.pelanggan_id)
            if pelanggan:
                pelanggan.saldo_kredit = (pelanggan.saldo_kredit or 0) - transaksi.total_setelah_diskon

        transaksi.status = "void"
        await db.commit()
        await db.refresh(transaksi)
        return transaksi

    @staticmethod
    async def get_transaksi_list(db: AsyncSession, kasir_id: Optional[uuid.UUID] = None, limit: int = 50) -> List[Transaksi]:
        stmt = select(Transaksi).order_by(Transaksi.created_at.desc())
        if kasir_id:
            stmt = stmt.where(Transaksi.kasir_id == kasir_id)
        result = await db.execute(stmt.limit(limit))
        return result.scalars().all()

    @staticmethod
    async def get_transaksi_by_id(db: AsyncSession, id: uuid.UUID) -> Optional[Transaksi]:
        result = await db.execute(select(Transaksi).where(Transaksi.id == id))
        return result.scalar_one_or_none()