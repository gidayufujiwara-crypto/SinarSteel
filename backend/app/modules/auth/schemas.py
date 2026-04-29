from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: UUID
    username: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class CreateUserRequest(BaseModel):
    username: str
    password: str
    full_name: str
    role: str = "karyawan"