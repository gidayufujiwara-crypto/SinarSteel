from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.dependencies import get_db, require_role
from app.modules.auth.models import User
from app.modules.settings.models import Setting
from app.modules.settings.schemas import SettingUpdate, SettingResponse
from fastapi import Form, File, UploadFile
from typing import Optional

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/", response_model=List[SettingResponse])
async def get_all(current_user: User = Depends(require_role("super_admin")), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting).order_by(Setting.key))
    return result.scalars().all()

@router.put("/{key}", response_model=SettingResponse)
async def update_setting(key: str, data: SettingUpdate, current_user: User = Depends(require_role("super_admin")), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        setting = Setting(key=key, value=data.value)
        db.add(setting)
    else:
        setting.value = data.value
    await db.commit()
    await db.refresh(setting)
    return setting

@router.put("/", response_model=dict)
async def update_settings(
    store_name: str = Form(...),
    store_address: str = Form(""),
    store_phone: str = Form(""),
    receipt_footer: str = Form(""),
    printer_type: str = Form("usb"),
    printer_path: str = Form(""),
    logo: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    # Simpan logo jika ada
    logo_url = None
    if logo:
        import os, uuid
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        ext = os.path.splitext(logo.filename)[1] if logo.filename else '.png'
        new_name = f"logo_{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(upload_dir, new_name)
        with open(file_path, "wb") as buffer:
            content = await logo.read()
            buffer.write(content)
        logo_url = f"/uploads/{new_name}"

    # Simpan data ke tabel settings (key-value)
    data = {
        "store_name": store_name,
        "store_address": store_address,
        "store_phone": store_phone,
        "receipt_footer": receipt_footer,
        "printer_type": printer_type,
        "printer_path": printer_path,
    }
    if logo_url:
        data["logo_url"] = logo_url

    for key, value in data.items():
        # Upsert: jika sudah ada, update; jika belum, insert
        stmt = select(Setting).where(Setting.key == key)
        result = await db.execute(stmt)
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            db.add(setting)
    await db.commit()
    return {"status": "success", "logo_url": logo_url}