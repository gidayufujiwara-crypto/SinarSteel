from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.dependencies import get_db, require_role
from app.modules.auth.models import User
from app.modules.settings.models import Setting
from app.modules.settings.schemas import SettingUpdate, SettingResponse

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