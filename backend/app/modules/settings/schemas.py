from pydantic import BaseModel
from typing import Optional

class SettingUpdate(BaseModel):
    value: Optional[str] = None

class SettingResponse(BaseModel):
    key: str
    value: Optional[str] = None
    class Config:
        from_attributes = True