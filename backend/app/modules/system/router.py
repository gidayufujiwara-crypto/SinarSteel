import os
import subprocess
import uuid
import shutil
from datetime import date, datetime
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

import pandas as pd
from sqlalchemy import text, inspect

from app.core.dependencies import get_db, require_role
from app.core.config import settings
from app.modules.auth.models import User

router = APIRouter(prefix="/system", tags=["System"])

BACKUP_DIR = Path("backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

def get_db_connection_string():
    """Mengubah DATABASE_URL async menjadi sync untuk pg_dump/psql"""
    url = settings.DATABASE_URL
    # Ganti postgresql+asyncpg:// menjadi postgresql://
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql://")
    return url

@router.post("/backup", response_model=dict)
async def backup_database(
    current_user: User = Depends(require_role("super_admin")),
):
    """Membackup database menggunakan pg_dump dan mengembalikan file download"""
    db_url = get_db_connection_string()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sinarsteel_backup_{timestamp}.sql"
    filepath = BACKUP_DIR / filename

    # Parsing URL untuk mendapatkan credentials
    # Format: postgresql://user:password@host:port/dbname
    try:
        url_parts = db_url.replace("postgresql://", "").split("@")
        user_pass = url_parts[0].split(":")
        user = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        host_port_db = url_parts[1].split("/")
        host_port = host_port_db[0].split(":")
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else "5432"
        dbname = host_port_db[1] if len(host_port_db) > 1 else "sinarsteel"
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal parsing DATABASE_URL")

    # Set environment variable untuk password
    env = os.environ.copy()
    env["PGPASSWORD"] = password

    cmd = [
        "pg_dump",
        "-h", host,
        "-p", port,
        "-U", user,
        "-d", dbname,
        "-f", str(filepath),
        "--clean",
        "--if-exists",
    ]

    try:
        subprocess.run(cmd, env=env, check=True, capture_output=True, text=True)
        return {"status": "success", "filename": filename, "path": str(filepath)}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Backup gagal: {e.stderr}")

@router.get("/download-backup/{filename}", response_class=FileResponse)
async def download_backup(
    filename: str,
    current_user: User = Depends(require_role("super_admin")),
):
    """Mengunduh file backup yang sudah dibuat"""
    filepath = BACKUP_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File backup tidak ditemukan")
    return FileResponse(path=str(filepath), filename=filename, media_type="application/sql")

@router.post("/restore", response_model=dict)
async def restore_database(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("super_admin")),
):
    """Merestore database dari file backup yang diupload"""
    # Simpan file sementara
    temp_dir = Path("temp_restore")
    os.makedirs(temp_dir, exist_ok=True)
    temp_file = temp_dir / f"restore_{uuid.uuid4().hex}.sql"

    with open(temp_file, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    db_url = get_db_connection_string()
    try:
        url_parts = db_url.replace("postgresql://", "").split("@")
        user_pass = url_parts[0].split(":")
        user = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        host_port_db = url_parts[1].split("/")
        host_port = host_port_db[0].split(":")
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else "5432"
        dbname = host_port_db[1] if len(host_port_db) > 1 else "sinarsteel"
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal parsing DATABASE_URL")

    env = os.environ.copy()
    env["PGPASSWORD"] = password

    cmd = [
        "psql",
        "-h", host,
        "-p", port,
        "-U", user,
        "-d", dbname,
        "-f", str(temp_file),
    ]

    try:
        subprocess.run(cmd, env=env, check=True, capture_output=True, text=True)
        os.remove(temp_file)
        return {"status": "success", "message": "Database berhasil direstore"}
    except subprocess.CalledProcessError as e:
        os.remove(temp_file)
        raise HTTPException(status_code=500, detail=f"Restore gagal: {e.stderr}")

@router.post("/export", response_model=dict)
async def export_table(
    table_name: str = Query(..., description="Nama tabel yang akan diexport"),
    format: str = Query("xlsx", description="Format: xlsx, csv"),
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Export tabel ke Excel atau CSV"""
    # Cek apakah tabel ada
    inspector = inspect(db.get_bind())
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail=f"Tabel '{table_name}' tidak ditemukan")

    # Ambil data menggunakan pandas
    result = await db.execute(text(f"SELECT * FROM {table_name}"))
    rows = result.fetchall()
    columns = result.keys()

    df = pd.DataFrame(rows, columns=columns)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_dir = Path("exports")
    os.makedirs(export_dir, exist_ok=True)

    if format == "xlsx":
        filename = f"{table_name}_{timestamp}.xlsx"
        filepath = export_dir / filename
        df.to_excel(filepath, index=False, engine="openpyxl")
    elif format == "csv":
        filename = f"{table_name}_{timestamp}.csv"
        filepath = export_dir / filename
        df.to_csv(filepath, index=False)
    else:
        raise HTTPException(status_code=400, detail="Format tidak didukung")

    return {"status": "success", "filename": filename, "path": str(filepath)}

@router.get("/download-export/{filename}", response_class=FileResponse)
async def download_export(
    filename: str,
    current_user: User = Depends(require_role("super_admin")),
):
    """Mengunduh file export"""
    filepath = Path("exports") / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File export tidak ditemukan")
    return FileResponse(path=str(filepath), filename=filename)

@router.post("/import", response_model=dict)
async def import_table(
    file: UploadFile = File(...),
    table_name: str = Query(..., description="Nama tabel tujuan"),
    current_user: User = Depends(require_role("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """Import data dari file Excel/CSV ke tabel"""
    # Simpan file sementara
    os.makedirs("temp_import", exist_ok=True)
    temp_file = f"temp_import/import_{uuid.uuid4().hex}"
    with open(temp_file, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Baca file
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(temp_file)
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(temp_file, engine="openpyxl")
        else:
            os.remove(temp_file)
            raise HTTPException(status_code=400, detail="Format file tidak didukung. Gunakan CSV atau Excel.")
    except Exception as e:
        os.remove(temp_file)
        raise HTTPException(status_code=400, detail=f"Gagal membaca file: {str(e)}")

    # Cek apakah tabel ada
    inspector = inspect(db.get_bind())
    if table_name not in inspector.get_table_names():
        os.remove(temp_file)
        raise HTTPException(status_code=404, detail=f"Tabel '{table_name}' tidak ditemukan")

    # Validasi kolom
    table_columns = [col["name"] for col in inspector.get_columns(table_name)]
    df_columns = df.columns.tolist()
    common_columns = [col for col in df_columns if col in table_columns]

    if not common_columns:
        os.remove(temp_file)
        raise HTTPException(status_code=400, detail="Tidak ada kolom yang cocok antara file dan tabel")

    # Cek duplikasi (berdasarkan primary key jika ada)
    pk_cols = [col["name"] for col in inspector.get_pk_constraint(table_name).get("constrained_columns", [])]
    inserted = 0
    skipped = 0

    for _, row in df.iterrows():
        row_dict = {col: row[col] for col in common_columns}

        # Cek duplikasi jika ada primary key
        if pk_cols:
            pk_values = {col: row[col] for col in pk_cols if col in row}
            if pk_values:
                # Cek apakah data dengan primary key yang sama sudah ada
                conditions = " AND ".join([f"{col} = :{col}" for col in pk_values])
                existing = await db.execute(
                    text(f"SELECT 1 FROM {table_name} WHERE {conditions} LIMIT 1"),
                    pk_values
                )
                if existing.scalar_one_or_none():
                    skipped += 1
                    continue

        # Insert
        columns_str = ", ".join(row_dict.keys())
        placeholders = ", ".join([f":{col}" for col in row_dict.keys()])
        try:
            await db.execute(
                text(f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"),
                row_dict
            )
            inserted += 1
        except Exception:
            skipped += 1

    await db.commit()
    os.remove(temp_file)

    return {
        "status": "success",
        "message": f"Data berhasil diimport. {inserted} baris ditambahkan, {skipped} baris dilewati (duplikat/error)."
    }