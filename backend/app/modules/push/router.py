from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db, get_current_user
from app.modules.auth.models import User
from app.modules.push.models import FcmToken

router = APIRouter(prefix="/push", tags=["Push Notification"])

@router.post("/register")
async def register_token(
    token: str,
    device: str = "android",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Cek apakah token sudah ada
    result = await db.execute(
        select(FcmToken).where(FcmToken.user_id == current_user.id, FcmToken.token == token)
    )
    existing = result.scalar_one_or_none()
    if not existing:
        new_token = FcmToken(user_id=current_user.id, token=token, device=device)
        db.add(new_token)
        await db.commit()
    return {"status": "ok"}