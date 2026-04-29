from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date
from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.report.schemas import DashboardMetrics, DashboardChartData, SalesReportItem
from app.modules.report.service import ReportService
from app.modules.auth.models import User
from typing import List
from app.modules.master.models import Produk
from app.modules.delivery.models import DeliveryOrder
from app.modules.auth.models import User
from sqlalchemy import func, select
from datetime import date, datetime

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