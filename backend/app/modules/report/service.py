import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract, case, cast, String
from app.modules.pos.models import Transaksi, TransaksiItem
from app.modules.master.models import Produk
from app.modules.wms.models import StockMutation
from app.modules.hr.models import Absensi
from app.modules.delivery.models import DeliveryOrder

class ReportService:
    @staticmethod
    async def get_dashboard_metrics(db: AsyncSession) -> dict:
        today = date.today()
        month_start = today.replace(day=1)

        # Revenue hari ini & bulan ini
        stmt_today = select(func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0)).where(
            Transaksi.status == "selesai",
            func.date(Transaksi.created_at) == today
        )
        revenue_today = (await db.execute(stmt_today)).scalar() or Decimal(0)

        stmt_month = select(func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0)).where(
            Transaksi.status == "selesai",
            func.date(Transaksi.created_at) >= month_start
        )
        revenue_month = (await db.execute(stmt_month)).scalar()

        # Growth (dibandingkan bulan lalu, sederhana)
        last_month_start = (month_start - timedelta(days=1)).replace(day=1)
        last_month_end = month_start - timedelta(days=1)
        stmt_last_month = select(func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0)).where(
            Transaksi.status == "selesai",
            func.date(Transaksi.created_at) >= last_month_start,
            func.date(Transaksi.created_at) <= last_month_end
        )
        last_month_rev = (await db.execute(stmt_last_month)).scalar()
        growth = 0.0
        if last_month_rev and last_month_rev > 0:
            growth = float((revenue_month - last_month_rev) / last_month_rev) * 100

        # Total transaksi hari ini
        stmt_count = select(func.count(Transaksi.id)).where(
            Transaksi.status == "selesai",
            func.date(Transaksi.created_at) == today
        )
        total_transactions = (await db.execute(stmt_count)).scalar() or 0

        # Avg order value
        avg_order = revenue_today / total_transactions if total_transactions > 0 else Decimal(0)

        # Stok kritis
        stmt_critical = select(func.count(Produk.id)).where(
            Produk.is_active == True,
            Produk.stok <= Produk.stok_minimum
        )
        critical_stock = (await db.execute(stmt_critical)).scalar() or 0

        # Pengiriman aktif hari ini
        stmt_delivery = select(func.count(DeliveryOrder.id)).where(
            DeliveryOrder.status != "selesai",
            func.date(DeliveryOrder.created_at) == today
        )
        active_deliveries = (await db.execute(stmt_delivery)).scalar() or 0

        return {
            "revenue_today": revenue_today,
            "revenue_month": revenue_month,
            "growth_percent": growth,
            "total_transactions": total_transactions,
            "avg_order_value": avg_order,
            "critical_stock": critical_stock,
            "active_deliveries": active_deliveries,
        }

    @staticmethod
    async def get_chart_data(db: AsyncSession) -> dict:
        # Revenue per bulan (8 bulan terakhir)
        revenue_series = []
        for i in range(8):
            start = (date.today().replace(day=1) - timedelta(days=30 * i)).replace(day=1)
            end = (start + timedelta(days=32)).replace(day=1) if start.month != 12 else start.replace(year=start.year+1, month=1, day=1)
            stmt = select(func.coalesce(func.sum(Transaksi.total_setelah_diskon), 0)).where(
                Transaksi.status == "selesai",
                Transaksi.created_at >= start,
                Transaksi.created_at < end
            )
            rev = (await db.execute(stmt)).scalar()
            revenue_series.append({
                "month": start.strftime("%b %y"),
                "revenue": rev or Decimal(0),
            })
        revenue_series.reverse()

        # Top 7 produk terlaris
        stmt_top = (
            select(Produk.nama, func.sum(TransaksiItem.qty).label("total_qty"), func.sum(TransaksiItem.subtotal).label("total_rev"))
            .join(TransaksiItem, TransaksiItem.produk_id == Produk.id)
            .group_by(Produk.id)
            .order_by(func.sum(TransaksiItem.subtotal).desc())
            .limit(7)
        )
        top_products = []
        rows = (await db.execute(stmt_top)).all()
        for row in rows:
            top_products.append({
                "nama": row.nama,
                "total_qty": row.total_qty,
                "total_revenue": row.total_rev,
            })

        # Order status distribution (hari ini)
        stmt_status = (
            select(Transaksi.status, func.count(Transaksi.id))
            .where(func.date(Transaksi.created_at) == date.today())
            .group_by(Transaksi.status)
        )
        order_status = []
        status_rows = (await db.execute(stmt_status)).all()
        for row in status_rows:
            order_status.append({"status": row.status, "count": row.count})

        # Absensi hari ini (jumlah hadir, terlambat, dll)
        stmt_absensi = (
            select(Absensi.status_hadir, func.count(Absensi.id))
            .where(Absensi.tanggal == date.today())
            .group_by(Absensi.status_hadir)
        )
        absensi_today = []
        absen_rows = (await db.execute(stmt_absensi)).all()
        for row in absen_rows:
            absensi_today.append({"status": row.status_hadir, "count": row.count})

        return {
            "revenue_series": revenue_series,
            "top_products": top_products,
            "order_status_dist": order_status,
            "absensi_today": absensi_today,
        }

    @staticmethod
    async def get_sales_report(db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[dict]:
        stmt = select(
            Transaksi.no_transaksi,
            Transaksi.created_at.label("tanggal"),
            Transaksi.kasir_id,
            Transaksi.pelanggan_id,
            Transaksi.total_setelah_diskon.label("total"),
            Transaksi.jenis_pembayaran,
        ).where(Transaksi.status == "selesai")

        if start_date:
            stmt = stmt.where(func.date(Transaksi.created_at) >= start_date)
        if end_date:
            stmt = stmt.where(func.date(Transaksi.created_at) <= end_date)

        stmt = stmt.order_by(Transaksi.created_at.desc()).limit(200)
        rows = (await db.execute(stmt)).all()

        result = []
        for row in rows:
            result.append({
                "no_transaksi": row.no_transaksi,
                "tanggal": row.tanggal,
                "kasir": str(row.kasir_id)[:8],
                "pelanggan": str(row.pelanggan_id)[:8] if row.pelanggan_id else "-",
                "total": row.total,
                "jenis_pembayaran": row.jenis_pembayaran,
            })
        return result