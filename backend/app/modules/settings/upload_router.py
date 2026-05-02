import os, uuid
from fastapi import APIRouter, UploadFile, File, Depends
from app.core.config import settings
from app.core.dependencies import require_role, get_current_user
from app.modules.auth.models import User

router = APIRouter()

@router.post("/upload-logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("super_admin"))
):
    # Buat folder upload jika belum ada
    upload_dir = os.path.join(settings.UPLOAD_DIR, "logo")
    os.makedirs(upload_dir, exist_ok=True)

    # Generate nama file unik
    ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
    new_name = f"logo_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, new_name)

    # Simpan file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Kembalikan URL relatif
    url = f"/uploads/logo/{new_name}"
    return {"url": url}