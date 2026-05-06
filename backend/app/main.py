import firebase_admin
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.modules.auth.router import router as auth_router
from app.modules.master import router as master_router
from app.modules.pos import router as pos_router
from app.modules.wms import router as wms_router
from app.modules.hr import router as hr_router
from app.modules.delivery import router as delivery_router
from app.modules.report import router as report_router
from app.modules.settings.router import router as settings_router
from app.modules.settings.upload_router import router as upload_router
from app.modules.system.router import router as system_router
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
from app.modules.push.router import router as push_router
from app.modules.wms.telegram_service import send_fcm_notification
from app.modules.master.models import Produk
from sqlalchemy import select
from firebase_admin import credentials

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Jalankan scheduler setiap 1 jam
    from app.modules.wms.telegram_service import send_telegram_notification
    from app.core.database import AsyncSessionLocal

    async def check_stock():
        async with AsyncSessionLocal() as db:
            await send_telegram_notification(db)
            # Hanya kirim FCM saat stok kritis
        produk_kritis = await db.execute(
            select(Produk).where(Produk.is_active == True, Produk.stok <= Produk.stok_minimum)
        )
        if produk_kritis.scalars().first():
            await send_fcm_notification(db, "Stok Kritis", "Ada produk yang perlu direstock. Cek aplikasi.")

    scheduler.add_job(check_stock, 'interval', hours=1)
    scheduler.start()
    yield
    scheduler.shutdown()

cred = credentials.Certificate("firebase-service-account.json")
firebase_admin.initialize_app(cred)   # HANYA SATU KALI DI SINI

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SinarSteel - Sistem Manajemen Toko Besi",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(master_router, prefix="/master", tags=["Master Data"])
app.include_router(pos_router, prefix="/pos", tags=["Point of Sale"])
app.include_router(wms_router, prefix="/wms", tags=["Warehouse Management"])
app.include_router(hr_router, prefix="/hr", tags=["Human Resources"])
app.include_router(delivery_router, prefix="/delivery", tags=["Delivery"])
app.include_router(report_router, prefix="/report", tags=["Reports"])
app.include_router(settings_router)
app.include_router(upload_router, prefix="/settings")
app.include_router(system_router)
app.include_router(push_router)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}