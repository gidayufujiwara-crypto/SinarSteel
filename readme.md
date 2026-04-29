# SinarSteel - Sistem Manajemen Toko Besi

Aplikasi desktop (Windows) + mobile (Android) untuk manajemen toko besi modern dengan tema neon futuristik.

## 📦 Tech Stack
- **Backend**: FastAPI (Python) + PostgreSQL + Redis
- **Frontend Desktop**: Electron + React + TypeScript + TailwindCSS (Neon Theme)
- **Mobile**: Flutter (Dart)
- **Auth**: JWT

## 🚀 Cara Menjalankan

### Persyaratan
- Python 3.11+
- Node.js 18+
- Flutter 3+
- Docker (opsional, untuk database)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env   # Isi SECRET_KEY dan sesuaikan DATABASE_URL
alembic upgrade head   # (setelah Phase 1 model dibuat)
uvicorn app.main:app --reload --port 8000