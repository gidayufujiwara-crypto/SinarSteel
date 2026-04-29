import uuid
from datetime import datetime, date
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_
from app.modules.wms.models import PurchaseOrder, PurchaseOrderItem, StockMutation, StockOpname
from app.modules.master.models import Produk, Supplier
from app.modules.auth.models import User

def generate_no_po():
    today = date.today().strftime("%Y%m%d")
    # Akan digabung dengan count di DB, sementara gunakan timestamp
    return f"PO-{today}-{uuid.uuid4().hex[:4].upper()}"

class WmsService:
    # ---------- Purchase Order ----------
    @staticmethod
    async def create_po(db: AsyncSession, data: dict, user: User) -> PurchaseOrder:
        no_po = generate_no_po()
        supplier_id = data["supplier_id"]
        items_data = data["items"]

        total = Decimal(0)
        item_list = []
        for it in items_data:
            produk = await db.get(Produk, it["produk_id"])
            if not produk:
                raise ValueError(f"Produk {it['produk_id']} tidak ditemukan")
            harga = it["harga_satuan"]
            qty = it["qty_order"]
            subtotal = harga * qty
            total += subtotal
            item_list.append({
                "produk_id": it["produk_id"],
                "qty_order": qty,
                "harga_satuan": harga,
                "subtotal": subtotal,
            })

        po = PurchaseOrder(
            no_po=no_po,
            supplier_id=supplier_id,
            status="draft",
            total=total,
            catatan=data.get("catatan"),
            created_by=user.id,
        )
        db.add(po)
        await db.flush()

        for item in item_list:
            pi = PurchaseOrderItem(
                po_id=po.id,
                produk_id=item["produk_id"],
                qty_order=item["qty_order"],
                harga_satuan=item["harga_satuan"],
                subtotal=item["subtotal"],
            )
            db.add(pi)

        await db.commit()
        await db.refresh(po)
        return po

    @staticmethod
    async def get_po_list(db: AsyncSession, status: Optional[str] = None) -> List[PurchaseOrder]:
        stmt = select(PurchaseOrder).order_by(PurchaseOrder.tanggal_order.desc())
        if status:
            stmt = stmt.where(PurchaseOrder.status == status)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_po_by_id(db: AsyncSession, po_id: uuid.UUID) -> Optional[PurchaseOrder]:
        result = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_po_status(db: AsyncSession, po_id: uuid.UUID, status: str) -> Optional[PurchaseOrder]:
        po = await WmsService.get_po_by_id(db, po_id)
        if not po:
            return None
        po.status = status
        await db.commit()
        await db.refresh(po)
        return po

    @staticmethod
    async def receive_po(db: AsyncSession, po_id: uuid.UUID, receive_data: dict, user: User) -> PurchaseOrder:
        po = await WmsService.get_po_by_id(db, po_id)
        if not po:
            raise ValueError("PO tidak ditemukan")
        if po.status not in ("ordered", "partial", "draft"):
            raise ValueError(f"PO dengan status '{po.status}' tidak dapat diterima")

        items_receive = receive_data["items"]
        # Map item_id ke qty_received
        receive_map = {UUID(item["item_id"]): item["qty_received"] for item in items_receive}

        all_received = True
        for item in po.items:
            if item.id in receive_map:
                qty = receive_map[item.id]
                item.qty_received += qty
                # Tambah stok produk
                produk = await db.get(Produk, item.produk_id)
                if produk:
                    produk.stok += qty
                # Catat mutasi masuk
                mutasi = StockMutation(
                    produk_id=item.produk_id,
                    tipe="masuk",
                    qty=qty,
                    referensi=f"PO-{po.no_po}",
                    keterangan="Penerimaan PO",
                    created_by=user.id,
                )
                db.add(mutasi)
            if item.qty_received < item.qty_order:
                all_received = False

        if all_received:
            po.status = "received"
            po.tanggal_diterima = datetime.utcnow()
        else:
            po.status = "partial"

        await db.commit()
        await db.refresh(po)
        return po

    # ---------- Stock Opname ----------
    @staticmethod
    async def create_stock_opname(db: AsyncSession, data: dict, user: User) -> List[StockOpname]:
        items = data["items"]
        opname_list = []
        for it in items:
            produk = await db.get(Produk, it["produk_id"])
            if not produk:
                continue
            qty_sistem = produk.stok
            qty_fisik = it["qty_fisik"]
            selisih = qty_fisik - qty_sistem
            so = StockOpname(
                produk_id=produk.id,
                qty_sistem=qty_sistem,
                qty_fisik=qty_fisik,
                selisih=selisih,
                keterangan=data.get("keterangan"),
                created_by=user.id,
            )
            db.add(so)
            # Sesuaikan stok
            produk.stok = qty_fisik
            # Mutasi jika ada selisih
            if selisih != 0:
                tipe = "opname_adjust"
                mut = StockMutation(
                    produk_id=produk.id,
                    tipe=tipe,
                    qty=abs(selisih),
                    referensi=f"SO-{so.id}",
                    keterangan="Penyesuaian stok opname",
                    created_by=user.id,
                )
                db.add(mut)
            opname_list.append(so)
        await db.commit()
        return opname_list

    @staticmethod
    async def get_stock_opname_list(db: AsyncSession, limit: int = 100) -> List[StockOpname]:
        result = await db.execute(
            select(StockOpname).order_by(StockOpname.tanggal.desc()).limit(limit)
        )
        return result.scalars().all()

    # ---------- Mutasi ----------
    @staticmethod
    async def get_mutations(db: AsyncSession, produk_id: Optional[uuid.UUID] = None, limit: int = 100) -> List[StockMutation]:
        stmt = select(StockMutation).order_by(StockMutation.created_at.desc())
        if produk_id:
            stmt = stmt.where(StockMutation.produk_id == produk_id)
        result = await db.execute(stmt.limit(limit))
        return result.scalars().all()

    # ---------- Inventory ----------
    @staticmethod
    async def get_inventory(db: AsyncSession, search: Optional[str] = None) -> List[Produk]:
        stmt = select(Produk).where(Produk.is_active == True)
        if search:
            stmt = stmt.where(
                Produk.nama.ilike(f"%{search}%") | Produk.sku.ilike(f"%{search}%")
            )
        stmt = stmt.order_by(Produk.stok.asc())
        result = await db.execute(stmt)
        return result.scalars().all()