import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.modules.pos.models import Shift, Transaksi, TransaksiItem, VoidPin
from app.modules.master.models import Produk, Pelanggan
from app.modules.auth.models import User
from app.core.security import verify_password
import random
import string

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

        rekap = await db.execute(
            select(
                func.count(Transaksi.id).label("total_trx"),
                func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0).label("total_penjualan")
            ).where(Transaksi.shift_id == shift.id, Transaksi.status == "selesai")
        )
        data = rekap.one()
        total_transaksi = data.total_trx or 0
        total_penjualan = data.total_penjualan or Decimal(0)

        result_tunai = await db.execute(
            select(func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0))
            .where(Transaksi.shift_id == shift.id, Transaksi.status == "selesai", Transaksi.jenis_pembayaran == "tunai")
        )
        total_tunai = result_tunai.scalar() or Decimal(0)

        seharusnya = shift.saldo_awal + total_penjualan
        selisih = total_setoran - seharusnya

        shift.waktu_tutup = datetime.utcnow()
        shift.total_transaksi = total_transaksi
        shift.total_tunai = total_tunai
        shift.total_transfer = Decimal(0)
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
        now = datetime.utcnow().strftime("%H%M%S")
        result = await db.execute(
            select(Transaksi.no_transaksi).where(
                Transaksi.no_transaksi.like(f"TRXSS-%-{today}-%")
            ).order_by(Transaksi.no_transaksi.desc()).limit(1)
        )
        last = result.scalar_one_or_none()
        if last:
            try:
                num = int(last.split("-")[-1]) + 1
            except (IndexError, ValueError):
                num = 1
        else:
            num = 1
        short_uuid = uuid.uuid4().hex[:6].upper()
        return f"TRXSS-{short_uuid}-{today}-{now}-{num:04d}"

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
            harga_setelah_diskon = harga - diskon

            if harga_setelah_diskon < produk.hpp_rata_rata:
                raise ValueError(
                    f"Harga bersih untuk produk {produk.nama} setelah diskon tidak boleh di bawah HPP rata‑rata (Rp {produk.hpp_rata_rata:,.2f})"
                )

            subtotal = harga_setelah_diskon * item["qty"]
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
        delivery_data = data.get("delivery")

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
        elif jenis == "cod":
            bayar = None
            kembalian = None
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
        await db.refresh(transaksi, attribute_names=['items'])

        if delivery_data:
            from app.modules.delivery.service import DeliveryService
            nominal_cod = total_setelah if jenis == "cod" else None
            await DeliveryService.create_order_from_pos(
                db,
                transaksi_id=transaksi.id,
                pelanggan_id=data.get("pelanggan_id"),
                nama_penerima=delivery_data["nama_penerima"],
                alamat_pengiriman=delivery_data["alamat"],
                kota=delivery_data["kota"],
                telepon=delivery_data.get("telepon"),
                nominal_cod=nominal_cod,
            )

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

class VoidService:
    @staticmethod
    async def request_void(db: AsyncSession, transaksi_id: uuid.UUID, current_user: User) -> str:
        if current_user.role != "super_admin":
            raise ValueError("Hanya super admin yang dapat meminta void")
        transaksi = await TransaksiService.get_transaksi_by_id(db, transaksi_id)
        if not transaksi:
            raise ValueError("Transaksi tidak ditemukan")
        if transaksi.status == "void":
            raise ValueError("Transaksi sudah di-void")

        pin = ''.join(random.choices(string.digits, k=6))
        void_pin = VoidPin(
            transaksi_id=transaksi_id,
            pin=pin,
            expires_at=datetime.utcnow() + timedelta(seconds=60)
        )
        db.add(void_pin)
        await db.commit()
        return pin

    @staticmethod
    async def verify_void(db: AsyncSession, transaksi_id: uuid.UUID, pin: str, current_user: User) -> Transaksi:
        if current_user.role != "super_admin":
            raise ValueError("Hanya super admin yang dapat melakukan void")
        result = await db.execute(
            select(VoidPin).where(
                VoidPin.transaksi_id == transaksi_id,
                VoidPin.pin == pin,
                VoidPin.used == False,
                VoidPin.expires_at > datetime.utcnow()
            )
        )
        void_pin = result.scalar_one_or_none()
        if not void_pin:
            raise ValueError("PIN tidak valid atau sudah kadaluarsa")

        void_pin.used = True
        transaksi = await TransaksiService.void_transaksi(db, transaksi_id, "", current_user)
        return transaksi

    @staticmethod
    async def get_pending_voids(db: AsyncSession) -> List[dict]:
        result = await db.execute(
            select(VoidPin).where(
                VoidPin.used == False,
                VoidPin.expires_at > datetime.utcnow()
            )
        )
        pins = result.scalars().all()
        return [{"transaksi_id": str(p.transaksi_id), "pin": p.pin} for p in pins]

class ReturService:
    @staticmethod
    async def retur_transaksi(db: AsyncSession, data: dict, kasir: User) -> Transaksi:
        if kasir.role not in ("super_admin", "manager"):
            raise ValueError("Hanya manager atau super admin yang dapat melakukan retur")

        transaksi_lama = await TransaksiService.get_transaksi_by_id(db, data["transaksi_id"])
        if not transaksi_lama:
            raise ValueError("Transaksi tidak ditemukan")
        if transaksi_lama.status == "retur":
            raise ValueError("Transaksi sudah diretur")
        today = date.today()
        if transaksi_lama.created_at.date() != today:
            raise ValueError("Retur hanya bisa dilakukan pada transaksi hari ini")

        for item in transaksi_lama.items:
            produk = await db.get(Produk, item.produk_id)
            if produk:
                produk.stok += item.qty

        transaksi_lama.status = "retur"
        await db.flush()

        new_data = {
            "pelanggan_id": transaksi_lama.pelanggan_id,
            "jenis_pembayaran": transaksi_lama.jenis_pembayaran,
            "items": data["items"],
            "diskon_total": data.get("diskon_total", 0),
            "bayar": None,
            "catatan": f"Retur dari transaksi {transaksi_lama.no_transaksi}",
        }
        new_transaksi = await TransaksiService.create_transaksi(db, kasir, new_data)
        new_transaksi.parent_id = transaksi_lama.id
        await db.commit()
        await db.refresh(new_transaksi)
        return new_transaksi