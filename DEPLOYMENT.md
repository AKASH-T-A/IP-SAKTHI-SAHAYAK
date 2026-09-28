# IP-SAKTI SAHAYAK — PRODUCTION DEPLOYMENT GUIDE
## SIH26045 | Intellectual Property & Regulatory Decision Support Platform for Ayurveda

---

### 1. Production Architecture Overview

- **Frontend:** Next.js 16.3.6 (React 19, TypeScript, Turbopack, App Router)
  - Hosted on Vercel / AWS Amplify / Docker Node.js container
  - Environment: Node.js 20+
- **Backend API:** FastAPI (Python 3.12, Uvicorn, SQLAlchemy 2.0 Async, Pydantic v2)
  - Hosted on AWS ECS / Render / Railway / DigitalOcean Droplet
  - High-performance asynchronous event loop
- **Database:** PostgreSQL 16 + pgvector Extension
  - Hosted on AWS RDS / Supabase / Neon / Managed PostgreSQL
  - Vector similarity indexing: IVFFlat or HNSW on `vector(1536)`
- **Corpus & Embeddings:** Authoritative Indian Statutory Corpus with OpenAI `text-embedding-3-small` / Local Sentence-Transformers

---

### 2. Environment Variables Configuration

Copy `.env.example` to `.env` in both `frontend` and `backend` directories:

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/ipsakti_db
JWT_SECRET=generate_with_openssl_rand_hex_32
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=your_openai_api_key_here
CORPUS_PATH=./data/corpus
ENVIRONMENT=production
CORS_ORIGINS=["https://ipsakti.ayush.gov.in","http://localhost:3000"]
```

---

### 3. Step-by-Step Deployment Procedure

#### Step A: Database Provisioning (PostgreSQL + pgvector)
1. Initialize PostgreSQL 16 instance.
2. Enable pgvector and run initialization DDL:
   ```bash
   psql -U postgres -d ipsakti_db -f backend/scripts/init_schema.sql
   ```
3. Verify that all 13 tables (`users`, `cases`, `formulations`, `source_chunks`, etc.) are created.

#### Step B: Backend Service Setup
1. Clone repository and set up Python 3.12 virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
2. Run database migration / initialization script:
   ```bash
   python -m app.db.init_db
   ```
3. Run test suite to verify RAG and citation validator:
   ```bash
   pytest tests/
   ```
4. Start Uvicorn production server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

#### Step C: Frontend Build & Launch
1. Navigate to frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Run production build:
   ```bash
   npm run build
   ```
3. Start production server:
   ```bash
   npm start -p 3000
   ```

---

### 4. Health Check & Monitoring Endpoints

- **Backend Health:** `GET http://localhost:8000/health` (Returns database status, pgvector status, and active corpus hash).
- **RAG Latency Metric:** Evaluated in `RAG_EVALUATION.md` (<50ms hybrid retrieval).
- **Frontend Health:** Direct HTTP 200 response on all 12 Next.js App Router paths.

---

### 5. Backup & Security Protocols

- Daily automated snapshots of PostgreSQL database with encrypted WAL archiving.
- CORS restricted to registered production domain.
- Signed URLs with expiration for any technical document or certificate access.
- Automated security testing against prompt injection with `test_versioning_and_security.py`.
