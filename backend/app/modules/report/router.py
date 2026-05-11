from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import date, datetime
from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.report.schemas import DashboardMetrics, DashboardChartData
from app.modules.report.service import ReportService
from app.modules.auth.models import User
from app.modules.master.models import Produk
from app.modules.delivery.models import DeliveryOrder
from app.modules.pos.models import Transaksi
from sqlalchemy import func, select

router = APIRouter()

@router.get("/notifications", response_model=List[dict])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notifications = []

    # 1. Stok kritis
    result = await db.execute(
        select(func.count(Produk.id)).where(Produk.is_active == True, Produk.stok <= Produk.stok_minimum)
    )
    critical_count = result.scalar() or 0
    if critical_count > 0:
        notifications.append({
            "type": "warning",
            "message": f"Stok kritis: {critical_count} produk perlu restock",
            "time": datetime.utcnow().isoformat(),
        })

    # 2. Penggajian (jika hari ini tanggal 28)
    if date.today().day == 28:
        notifications.append({
            "type": "info",
            "message": "Hari ini jadwal penggajian bulanan",
            "time": datetime.utcnow().isoformat(),
        })

    # 3. Pengiriman pending
    result = await db.execute(
        select(func.count(DeliveryOrder.id)).where(DeliveryOrder.status != "selesai")
    )
    pending_deliveries = result.scalar() or 0
    if pending_deliveries > 0:
        notifications.append({
            "type": "info",
            "message": f"Pengiriman pending: {pending_deliveries} order",
            "time": datetime.utcnow().isoformat(),
        })

    return notifications

@router.get("/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    current_user: User = Depends(require_role("super_admin", "manager", "kasir", "gudang", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    metrics = await ReportService.get_dashboard_metrics(db)
    return metrics

@router.get("/dashboard/charts", response_model=DashboardChartData)
async def get_dashboard_charts(
    current_user: User = Depends(require_role("super_admin", "manager", "kasir", "gudang", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    charts = await ReportService.get_chart_data(db)
    return charts

@router.get("/sales", response_model=List[dict])
async def get_sales_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_role("super_admin", "manager", "kasir")),
    db: AsyncSession = Depends(get_db)
):
    data = await ReportService.get_sales_report(db, start_date, end_date)
    return data

@router.get("/dashboard/summary")
async def get_dashboard_summary(
    current_user: User = Depends(require_role("super_admin", "manager", "kasir", "gudang", "hr_admin")),
    db: AsyncSession = Depends(get_db)
):
    metrics = await ReportService.get_dashboard_metrics(db)
    charts = await ReportService.get_chart_data(db)

    # Recent orders
    stmt = (
        select(Transaksi)
        .where(func.date(Transaksi.created_at) == date.today())
        .order_by(Transaksi.created_at.desc())
        .limit(5)
    )
    transaksi_rows = (await db.execute(stmt)).scalars().all()
    recent_orders = []
    for trx in transaksi_rows:
        recent_orders.append({
            "order_number": trx.no_transaksi,
            "customer": "Pelanggan",
            "total": trx.total_setelah_diskon,
            "time": trx.created_at.strftime("%H:%M"),
        })

    # Alerts
    alerts = []
    result = await db.execute(
        select(func.count(Produk.id)).where(Produk.is_active == True, Produk.stok <= Produk.stok_minimum)
    )
    critical_count = result.scalar() or 0
    if critical_count > 0:
        alerts.append({
            "type": "critical",
            "message": f"Stok kritis: {critical_count} produk perlu restock",
            "time": "Baru"
        })

    if date.today().day == 28:
        alerts.append({
            "type": "info",
            "message": "Hari ini jadwal penggajian bulanan",
            "time": "Hari ini"
        })

    result = await db.execute(
        select(func.count(DeliveryOrder.id)).where(DeliveryOrder.status != "selesai")
    )
    pending_deliveries = result.scalar() or 0
    if pending_deliveries > 0:
        alerts.append({
            "type": "warning",
            "message": f"Pengiriman pending: {pending_deliveries} order",
            "time": "Baru"
        })

    return {
        "sales_today": metrics["revenue_today"],
        "transactions_today": metrics["total_transactions"],
        "low_stock_count": metrics["critical_stock"],
        "pending_delivery_count": metrics["active_deliveries"],
        "revenue_series": charts["revenue_series"],
        "top_products": charts["top_products"],
        "recent_orders": recent_orders,
        "alerts": alerts,
    }