import os
import sys
import subprocess
import importlib
import traceback
from pathlib import Path


BASE_DIR = Path(__file__).parent
BACKEND_DIR = BASE_DIR / 'backend'
FRONTEND_DIR = BASE_DIR / 'frontend'

def log(msg, status="OK"):
    symbol = "✅" if status == "OK" else "❌"
    print(f"{symbol} {msg}")

def check_python_syntax():
    """Periksa sintaks dasar semua file .py di backend/app"""
    app_dir = BACKEND_DIR / 'app'
    errors = []
    for py_file in app_dir.rglob('*.py'):
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                source = f.read()
            compile(source, str(py_file), 'exec')
        except SyntaxError as e:
            errors.append(f"{py_file.relative_to(BACKEND_DIR)}: {e}")
    if errors:
        log(f"Sintaks Python: {len(errors)} error ditemukan", "ERR")
        for err in errors:
            print(f"   - {err}")
    else:
        log("Sintaks Python: sempurna")

def check_python_imports():
    """Coba impor modul utama untuk mendeteksi ImportError"""
    sys.path.insert(0, str(BACKEND_DIR))
    modules_to_test = [
        'app.main',
        'app.core.config',
        'app.core.database',
        'app.modules.auth.models',
        'app.modules.pos.models',
    ]
    failed = []
    for mod_name in modules_to_test:
        try:
            importlib.import_module(mod_name)
        except Exception as e:
            failed.append(f"{mod_name}: {str(e)[:100]}")
    if failed:
        log(f"Impor Python: {len(failed)} modul gagal", "ERR")
        for f in failed:
            print(f"   - {f}")
    else:
        log("Impor Python: semua modul utama berhasil diimpor")

def check_database():
    """Cek apakah database bisa terkoneksi dan tabel users ada"""
    try:
        from app.core.database import AsyncSessionLocal
        from sqlalchemy import text
        import asyncio

        async def _check():
            async with AsyncSessionLocal() as db:
                await db.execute(text("SELECT 1 FROM users LIMIT 1"))
                return True
        asyncio.run(_check())
        log("Database: terkoneksi & tabel users ada")
    except Exception as e:
        log(f"Database: gagal - {e}", "ERR")

def check_frontend():
    """Jalankan tsc --noEmit untuk mengecek TypeScript"""
    if not (FRONTEND_DIR / 'node_modules').exists():
        log("Frontend: node_modules tidak ditemukan, skip")
        return
    try:
        result = subprocess.run(
            ['npx', 'tsc', '--noEmit'],
            cwd=FRONTEND_DIR,
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            log("Frontend TypeScript: bersih")
        else:
            log(f"Frontend TypeScript: ada error", "ERR")
            lines = result.stderr.strip().split('\n')
            for line in lines[:10]:
                print(f"   {line}")
    except FileNotFoundError:
        log("Frontend: npx/tsc tidak tersedia, skip")
    except subprocess.TimeoutExpired:
        log("Frontend: timeout, skip")

if __name__ == '__main__':
    print("=== PEMERIKSAAN PROYEK SINARSTEEL ===")
    check_python_syntax()
    check_python_imports()
    check_database()
    check_frontend()
    print("=== SELESAI ===")