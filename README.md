# IP-SAKTI SAHAYAK — PROJECT ROOT
## SIH26045 | SIH 2026 | Multilingual AI-Powered IP & Regulatory Intelligence for Ayurveda

---

## Quick Start

### Frontend (Next.js)
```bash
cd frontend
npm run dev
# Opens at http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
# Copy .env.example to .env and fill in values
cp .env.example .env

# Activate virtual environment
.\venv\Scripts\activate         # Windows
source venv/bin/activate        # Linux/Mac

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
# Opens at http://localhost:8000/api/docs
```

---

## Project Structure

```
SAKTHI-SIH/
├── frontend/           Next.js 14 + TypeScript + Tailwind + shadcn/ui
│   └── src/
│       ├── app/        Next.js App Router pages
│       ├── components/ Reusable UI components
│       ├── lib/        API client, utilities
│       └── store/      Zustand global state
│
├── backend/            FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/        Route handlers
│   │   ├── core/       Config, security
│   │   ├── db/         Database session
│   │   ├── models/     SQLAlchemy ORM models
│   │   ├── schemas/    Pydantic request/response models
│   │   ├── services/   Business logic
│   │   ├── rag/        Retrieval pipeline
│   │   └── classification/ Rule engine
│   ├── alembic/        Database migrations
│   └── tests/          pytest test suite
│
└── README.md
```

---

## Environment Setup

### Backend `.env` required variables:
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (32+ chars) |
| `OPENAI_API_KEY` | For embeddings + LLM |
| `STORAGE_BUCKET` | S3-compatible storage bucket |

### Frontend `.env.local` required variables:
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `NEXTAUTH_URL` | Frontend base URL |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Radix UI, Framer Motion |
| Backend | FastAPI, Python 3.12, Pydantic v2, SQLAlchemy 2.0 |
| Database | PostgreSQL 16 + pgvector |
| Auth | JWT (access + refresh tokens) |
| RAG | Hybrid BM25 + pgvector + cross-encoder reranker |
| LLM | OpenAI GPT-4o |
| Embeddings | text-embedding-3-small |
| Storage | Supabase Storage / S3-compatible |

---

## Design System

**Palette:** Heritage + Science + Trust + AI
- Background: Warm ivory (#FAFAF7)
- Primary: Botanical green (#2D5A3D)
- Accent: Earth gold (#C49A28)
- Text: Charcoal (#1C1C1C)

**Typography:**
- Headings: Playfair Display (serif, authoritative)
- Body: Inter (clean, readable)
- Code/Legal: JetBrains Mono

---

## SIH Demo Flow

1. Open platform → professional home page
2. Click "Analyze My Product"
3. Enter Ashwagandha formulation details (guided wizard)
4. View Formulation DNA
5. View Classification with evidence chain
6. Click "Why?" to see "Why am I seeing this?"
7. View IP Pathway map
8. View ABS/TK assessment
9. Demonstrate Safe Abstention
10. Generate report
11. Switch to Hindi

---

*Blueprint version: 1.0 | SIH26045 | Build started: 2026-09-27*
