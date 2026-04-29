from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user, require_role
from app.modules.delivery import schemas
from app.modules.delivery.service import DeliveryService
from app.modules.auth.models import User
from uuid import UUID
from fastapi import File, UploadFile

router = APIRouter()

@router.get("/orders", response_model=List[schemas.DeliveryOrderResponse])
async def list_orders(
    status: Optional[str] = Query(None),
    driver_id: Optional[UUID] = Query(None),
    current_user: User = Depends(require_role("super_admin", "manager", "driver")),
    db: AsyncSession = Depends(get_db)
):
    return await DeliveryService.get_orders(db, status, driver_id)

@router.get("/orders/{id}", response_model=schemas.DeliveryOrderResponse)
async def get_order(
    id: UUID,
    current_user: User = Depends(require_role("super_admin", "manager", "driver")),
    db: AsyncSession = Depends(get_db)
):
    order = await DeliveryService.get_order_by_id(db, id)
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    return order

@router.post("/orders", response_model=schemas.DeliveryOrderResponse, status_code=201)
async def create_order(
    data: schemas.DeliveryOrderCreate,
    current_user: User = Depends(require_role("super_admin", "manager")),
    db: AsyncSession = Depends(get_db)
):
    return await DeliveryService.create_order(db, data.model_dump())

@router.put("/orders/{id}/assign", response_model=schemas.DeliveryOrderResponse)
async def assign_driver(
    id: UUID,
    driver_id: UUID = Query(...),
    current_user: User = Depends(require_role("super_admin", "manager")),
    db: AsyncSession = Depends(get_db)
):
    try:
        order = await DeliveryService.assign_driver(db, id, driver_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order tidak ditemukan")
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/orders/{id}/status", response_model=schemas.DeliveryOrderResponse)
async def update_status(
    id: UUID,
    data: schemas.StatusUpdateRequest,
    current_user: User = Depends(require_role("super_admin", "manager", "driver")),
    db: AsyncSession = Depends(get_db)
):
    try:
        order = await DeliveryService.update_status(db, id, data.model_dump())
        if not order:
            raise HTTPException(status_code=404, detail="Order tidak ditemukan")
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/orders/{id}/cod-confirm", response_model=schemas.DeliveryOrderResponse)
async def confirm_cod(
    id: UUID,
    data: schemas.CODConfirmRequest,
    current_user: User = Depends(require_role("super_admin", "manager", "driver")),
    db: AsyncSession = Depends(get_db)
):
    order = await DeliveryService.confirm_cod(db, id, data, current_user)
    if not order:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    return order

@router.get("/driver/today", response_model=List[schemas.DeliveryOrderResponse])
async def driver_today_orders(
    driver_id: UUID = Query(...),
    current_user: User = Depends(require_role("super_admin", "manager", "driver")),
    db: AsyncSession = Depends(get_db)
):
    return await DeliveryService.get_driver_orders_today(db, driver_id)

@router.get("/driver/history", response_model=List[schemas.DeliveryOrderResponse])
async def driver_history(
    driver_id: UUID = Query(...),
    current_user: User = Depends(require_role("super_admin", "manager", "driver")),
    db: AsyncSession = Depends(get_db)
):
    return await DeliveryService.get_driver_history(db, driver_id)

@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("super_admin", "manager", "driver")),
):
    import os, uuid
    from app.core.config import settings

    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
    new_name = f"cod_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, new_name)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    return {"url": f"/uploads/{new_name}"}