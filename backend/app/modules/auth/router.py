from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from typing import List

from app.core.dependencies import get_db, get_current_user, require_role
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.modules.auth.schemas import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserResponse,
    CreateUserRequest,      # <-- skema baru
)
from app.modules.auth.service import AuthService
from app.modules.auth.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await AuthService.authenticate(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username atau password salah")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun tidak aktif")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token tidak valid")

    user_id = payload.get("sub")
    user = await AuthService.get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Pengguna tidak ditemukan")

    new_access = create_access_token(data={"sub": str(user.id), "role": user.role})
    new_refresh = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=new_access, refresh_token=new_refresh)

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

# ---------- Manajemen User (super_admin) ----------
@router.get("/users", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).order_by(User.username))
    return result.scalars().all()

@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(
    data: CreateUserRequest,
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username sudah digunakan")
    user = await AuthService.create_user(
        db,
        username=data.username,
        password=data.password,
        full_name=data.full_name,
        role=data.role,
    )
    return user

@router.delete("/users/{id}", status_code=204)
async def delete_user(
    id: uuid.UUID,
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db)
):
    if id == current_user.id:
        raise HTTPException(status_code=400, detail="Tidak dapat menghapus diri sendiri")
    user = await db.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    await db.delete(user)
    await db.commit()