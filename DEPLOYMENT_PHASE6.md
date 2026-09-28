# IP-SAKTI SAHAYAK — PRODUCTION DEPLOYMENT & DEVOPS MANUAL (PHASE 6)
## SIH26045 | Intellectual Property & Regulatory Decision Support Platform for Ayurveda

---

### 1. Production Architecture Overview

- **Frontend Tier:** Next.js 16.3.6 (React 19, TypeScript, Turbopack, App Router)
  - Hosted on Vercel / AWS Amplify / Containerized Node.js 20+
- **Backend Tier:** FastAPI (Python 3.12, Uvicorn ASGI, SQLAlchemy 2.0 Async, Pydantic v2)
  - Hosted on AWS ECS / DigitalOcean Droplet / Render / Railway
- **Persistence Tier:** PostgreSQL 16 + pgvector Extension
  - Hosted on AWS RDS / Supabase / Managed PostgreSQL
- **Storage Tier:** S3-Compatible Object Storage (AWS S3, MinIO) for quarantined document storage

---

### 2. Environment Variables Configuration

#### Backend Configuration (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://postgres:your_secure_password@localhost:5432/ipsakti_db
JWT_SECRET=use_openssl_rand_hex_32_to_generate_secure_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=your_openai_api_key_here
CORPUS_PATH=./data/corpus
ENVIRONMENT=production
CORS_ORIGINS=["https://ipsakti.ayush.gov.in","http://localhost:3000"]
```

#### Frontend Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

---

### 3. Step-by-Step Deployment Procedure

#### Step 1: PostgreSQL & pgvector Provisioning
```bash
# Connect to PostgreSQL 16
psql -U postgres -c "CREATE DATABASE ipsakti_db;"
psql -U postgres -d ipsakti_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql -U postgres -d ipsakti_db -f backend/scripts/init_schema.sql
```

#### Step 2: Backend API Deployment
```bash
cd backend
python -m venv venv
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt

# Run database table initialization and validation
python -m app.db.init_db

# Run full test suite (must pass 18/18 tests)
pytest tests/

# Launch Uvicorn production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Step 3: Frontend Build & Deployment
```bash
cd ../frontend
npm install
npm run build
npm start -p 3000
```

---

### 4. Health Check Endpoints & Monitoring

- **Liveness Probe:** `GET /health` or `GET /api/health`
  - Returns `{"status": "healthy", "service": "ip-sakti-api", "version": "1.0.0"}`
- **Readiness Probe:** `GET /ready` or `GET /api/ready`
  - Returns deep dependency status: `corpus_loaded: true`, `corpus_records: 12`, `database_backend: "postgresql+pgvector"`
- **Search Endpoint:** `GET /api/v1/search?q=Section%203(p)`
- **Assistant Endpoint:** `POST /api/v1/assistant/query`
- **Sources Endpoint:** `GET /api/v1/sources`

---

### 5. Common Failure Modes & Recovery Runbook

1. **Missing `vector` extension in PostgreSQL:**
   - Error: `type "vector" does not exist`
   - Remedy: Run `CREATE EXTENSION vector;` as a superuser in PostgreSQL.
2. **Missing `email-validator` library:**
   - Error: `No module named 'email_validator'`
   - Remedy: Included in updated `requirements.txt`; install via `pip install email-validator`.
3. **CORS Rejection from Frontend:**
   - Remedy: Ensure `CORS_ORIGINS` in `backend/.env` includes the deployed frontend domain.
