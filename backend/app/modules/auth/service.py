from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.security import hash_password, verify_password
from app.modules.auth.models import User
import uuid

class AuthService:
    @staticmethod
    async def create_user(
        db: AsyncSession,
        username: str,
        password: str,
        full_name: str,
        role: str = "karyawan",
    ) -> User:
        user = User(
            username=username,
            password_hash=hash_password(password),
            full_name=full_name,
            role=role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate(db: AsyncSession, username: str, password: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()
        if user is None:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()