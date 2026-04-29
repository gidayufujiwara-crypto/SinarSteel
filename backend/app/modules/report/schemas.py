from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class DashboardMetrics(BaseModel):
    revenue_today: Decimal
    revenue_month: Decimal
    growth_percent: float
    total_transactions: int
    avg_order_value: Decimal
    critical_stock: int
    active_deliveries: int

class RevenueSeriesItem(BaseModel):
    month: str
    revenue: Decimal

class TopProductItem(BaseModel):
    nama: str
    total_qty: int
    total_revenue: Decimal

class OrderStatusItem(BaseModel):
    status: str
    count: int

class AbsensiStatusItem(BaseModel):
    status: str
    count: int

class DashboardChartData(BaseModel):
    revenue_series: List[RevenueSeriesItem]
    top_products: List[TopProductItem]
    order_status_dist: List[OrderStatusItem]
    absensi_today: List[AbsensiStatusItem]

# Laporan Penjualan
class SalesReportItem(BaseModel):
    no_transaksi: str
    tanggal: datetime
    kasir: str
    pelanggan: str
    total: Decimal
    jenis_pembayaran: str

class SalesReportResponse(BaseModel):
    data: List[SalesReportItem]

    class Config:
        from_attributes = True