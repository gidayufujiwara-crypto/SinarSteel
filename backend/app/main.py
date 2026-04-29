from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import semua router (sementara yang non-auth akan kita stub/tambah placeholder)
from app.modules.auth.router import router as auth_router
# Untuk module lainnya kita buat placeholder router (nanti di phase berikutnya akan diisi)
# Tetap daftarkan agar struktur API siap
from app.modules.master import router as master_router  # akan kita buat
from app.modules.pos import router as pos_router
from app.modules.wms import router as wms_router
from app.modules.hr import router as hr_router
from app.modules.delivery import router as delivery_router
from app.modules.report import router as report_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SinarSteel - Sistem Manajemen Toko Besi",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(master_router, prefix="/master", tags=["Master Data"])
app.include_router(pos_router, prefix="/pos", tags=["Point of Sale"])
app.include_router(wms_router, prefix="/wms", tags=["Warehouse Management"])
app.include_router(hr_router, prefix="/hr", tags=["Human Resources"])
app.include_router(delivery_router, prefix="/delivery", tags=["Delivery"])
app.include_router(report_router, prefix="/report", tags=["Reports"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}