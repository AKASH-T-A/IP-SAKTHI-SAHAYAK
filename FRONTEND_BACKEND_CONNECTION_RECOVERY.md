# IP-SAKTI Sahayak — Frontend / Backend Connection Recovery Report

**Project:** IP-SAKTI Sahayak (SIH26045)  
**Date:** September 29, 2026  
**Status:** CONNECTED & FULLY VERIFIED  

---

## 1. Network Interruption Recovery
The previous session experienced a remote TCP connection reset while establishing the frontend-backend communication layer.
During recovery, the workspace was preserved without resetting the repository, deleting files, or re-implementing completed code. Inspection confirmed that all foundational intelligence models, translations, and UI modules remained intact.

---

## 2. What Was Already Completed Prior to Recovery
- **Multilingual System:** All 22 Eighth Schedule languages + English (23 total) with complete language isolation and RTL support (Urdu, Kashmiri, Sindhi).
- **Authoritative Statutory Corpus:** Complete statutory corpus covering Patents Act (Section 3(p), Section 3(e), Section 10(4)(ii)(D)), Drugs and Cosmetics Act (Rule 158B, Schedule T), Biological Diversity Act (Form III, Section 6, Section 7), and FSSAI Ayurveda-Aahar Regulations.
- **FastAPI Endpoints:** Complete backend route set under `/api/v1` for assistant, search, sources, cases, regulatory compliance, claims checking, label review, expert consultation, relational graph, and evaluation metrics.
- **Frontend API Client:** Base Axios instance (`frontend/src/lib/api/client.ts`) with request interceptor for JWT injection, refresh retry, and error normalization.
- **Assistant & Search UI:** Initial connection hooks in `assistant/page.tsx`, `search/page.tsx`, `evidence/page.tsx`, `claims/page.tsx`, `label-review/page.tsx`, and `ExpertConsultationModal.tsx`.

---

## 3. What Was Incomplete
1. **Database Schema & Admin Seeding:** Database tables and initial administrator user (`admin@ipsakti.in`) had not been initialized in SQLite (`backend/ipsakti.db`), preventing authenticated CRUD operations on `/cases`.
2. **Case Persistence Wiring:** The new case creation wizard (`/cases/new`) was only writing to client-side Zustand storage with synthetic IDs rather than calling `POST /api/v1/cases` and persisting to the FastAPI database.
3. **Case Detail Deep-Linking:** `/cases/[id]` lacked backend retrieval fallback when navigated to directly by backend UUID.
4. **Regulatory Checklist Connection:** `/regulations` step 4 had not wired `regulatoryApi.checklist()` to overlay backend compliance items.
5. **Services Offline:** Neither FastAPI (`http://127.0.0.1:8000`) nor Next.js (`http://localhost:3000`) was running following the network disconnection.
6. **Async/Await Syntax in Form Handler:** A missing `async` keyword on `handleSubmit` in `cases/new/page.tsx` blocked TypeScript compilation.

---

## 4. What Was Fixed
1. **Database Initialization & Seeding:**
   - Ran `init_database()` asynchronously to verify and generate all SQLAlchemy tables.
   - Seeded default administrator `admin@ipsakti.in` with encrypted bcrypt password.
2. **Case CRUD Backend Connection:**
   - Updated `cases/new/page.tsx` to asynchronously invoke `casesApi.create()` on submission, store the returned database UUID, and route to `/cases/{uuid}`.
   - Updated `useCasesStore` to accept backend-assigned IDs and support `syncBackendCases` merging.
   - Connected `cases/page.tsx` to automatically pull `casesApi.list()` on mount and synchronize backend records into the store.
   - Connected `cases/[id]/page.tsx` to query `casesApi.get(caseId)` if the dossier is not already in client memory.
3. **Regulatory Checklist Integration:**
   - Connected `regulations/page.tsx` step 4 to query `regulatoryApi.checklist()` dynamically.
4. **TypeScript & Verification Script Parity:**
   - Fixed `async` function declaration in `cases/new/page.tsx`.
   - Updated canonical proper name exemption for `"BHASHINI"` (`nav.assistant`) across translation audit scripts.
5. **Services Activated:**
   - Started FastAPI server on `http://127.0.0.1:8000`.
   - Started Next.js Turbopack dev server on `http://localhost:3000`.

---

## 5. API Base URL
- **Frontend URL:** `http://localhost:3000`
- **Backend URL:** `http://127.0.0.1:8000`
- **API Base:** `http://127.0.0.1:8000/api/v1`
- **Frontend Environment Config:** `frontend/.env.local`
  ```bash
  NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
  ```
- **Backend Health Endpoint:** `http://127.0.0.1:8000/api/health`
  ```json
  {
    "status": "healthy",
    "service": "ip-sakti-api",
    "version": "1.0.0",
    "timestamp": 1790690434.926
  }
  ```

---

## 6. Connected Endpoints Status Matrix

| Feature | Endpoint | HTTP Method | Connection Status | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Assistant** | `/api/v1/assistant/query` | POST | **CONNECTED** | Real-time statutory citations & multilingual RAG |
| **Search** | `/api/v1/search` | GET | **CONNECTED** | Keyword + intent search over gazettes |
| **Cases List** | `/api/v1/cases` | GET | **CONNECTED** | Authenticated paginated cases from SQLite |
| **Cases Create** | `/api/v1/cases` | POST | **CONNECTED** | Generates real UUID, persists to database |
| **Cases Get** | `/api/v1/cases/{id}` | GET | **CONNECTED** | Retrieves individual dossier by UUID |
| **Evidence / Sources** | `/api/v1/sources` | GET | **CONNECTED** | 19 active authoritative statutory corpus items |
| **Regulatory Checklist** | `/api/v1/regulatory/checklist`| POST | **CONNECTED** | 14-point compliance checklist |
| **Regulatory Evaluate** | `/api/v1/regulatory/evaluate` | POST | **CONNECTED** | Deterministic rule classification |
| **Claims Checker** | `/api/v1/claims/check` | POST | **CONNECTED** | Drugs & Magic Remedies Act § 3 scanner |
| **Label Review** | `/api/v1/label/review` | POST | **CONNECTED** | Schedule T & D&C Rule 161 compliance reviewer |
| **Expert Consultation** | `/api/v1/expert/consultation-package` | POST | **CONNECTED** | Generates structured Markdown consultation package |
| **Knowledge Graph** | `/api/v1/graph/relational-map` | POST | **CONNECTED** | Multi-tiered relational knowledge graph |
| **Authentication** | `/api/v1/auth/login` | POST | **CONNECTED** | Issues JWT access & refresh tokens |
| **User Profile** | `/api/v1/auth/me` | GET | **CONNECTED** | Token-authenticated user verification |
| **Voice / Bhashini** | Client provider | - | **CONNECTED** | Accurately indicates Web Speech fallback mode |
| **Language Selection** | State + API parameter | - | **CONNECTED** | Passes `language` parameter to backend queries |

---

## 7. Assistant Connection
- **Endpoint:** `POST /api/v1/assistant/query`
- **Request Parameters:** `query`, `language`, `case_context`
- **Response Parameters:** `abstained`, `detected_intent`, `answer`, `why`, `evidence_strength`, `citations`, `missing_information`, `next_actions`
- **Verification:** Verified both in terminal via HTTP request and live in the browser via subagent session. A query on *"Can an Ayurvedic formulation containing Ashwagandha be patented?"* returns `evidence_strength: High` with citations from **Patents Act 1970 § 3(p)**, **Section 10(4)(ii)(D)**, and **Drugs & Magic Remedies Act 1954 § 3**.

---

## 8. Case Connection & Persistence
- **Endpoints:** `POST /api/v1/cases`, `GET /api/v1/cases`, `GET /api/v1/cases/{id}`
- **Verification:** Created case `"Ayurvedic Ashwagandha Brahmi Complex"`, verified database assignment of UUID `f00c8909-6c9d-457b-870f-f6e79fed9cac`, and confirmed persistence upon retrieval.
- **Frontend Integration:** `/cases/new` invokes `casesApi.create()`, handles offline fallback gracefully, and syncs active lists on `/cases`.

---

## 9. Search Connection
- **Endpoint:** `GET /api/v1/search?q={query}&jurisdiction={jur}&authority={auth}`
- **Verification:** Querying `"Section 3(p)"` returns 5 authoritative statutory records matching the query, classified under intent `"PATENT"`. Results overlay automatically on `search/page.tsx`.

---

## 10. Evidence Connection
- **Endpoint:** `GET /api/v1/sources`
- **Verification:** Returns 19 official gazette entries with checksums, authorities (CGPDTM, CDSCO, MoA, NBA), and full statutory text. `evidence/page.tsx` pulls from backend on load.

---

## 11. Multilingual Connection
- Language preference is passed from frontend to backend (`language: kn`, `language: hi`, etc.).
- The backend multilingual engine (`backend/app/rag/multilingual.py`) generates localized explanations while strictly preserving canonical statutory tokens:
  - *Section 3(p)*
  - *Section 3(e)*
  - *Section 10(4)(ii)(D)*
  - *Rule 158B*
  - *Schedule T*
  - *Form III*
  - *Patents Act, 1970*
- **Test Request:** `"ಅಶ್ವಗಂಧದ ಉತ್ಪನ್ನಕ್ಕೆ ಪೇಟೆಂಟ್ ಪಡೆಯಬಹುದೇ?"` (`kn`) returns native Kannada decision-support output with statutory citations intact.

---

## 12. Voice Connection (BHASHINI & Web Speech)
- Bhashini integration is configured through `bhashiniProvider.ts`.
- When external cloud API credentials are not set, the UI transparently displays the active fallback state (`Web Speech API / Local RAG`) without fabricating connectivity.
- Microphones, speech-to-text transcripts, and text-to-speech are wired through native Web Speech API.

---

## 13. Authentication & Security
- `POST /api/v1/auth/login` accepts email and password, returning signed JWT access and refresh tokens.
- Passwords are validated using bcrypt.
- Tokens are stored in client `localStorage` and injected into every Axios request header as `Authorization: Bearer <token>`.
- Admin account seeded and validated: `admin@ipsakti.in` / `Admin@12345`.

---

## 14. CORS Configuration
- Backend `backend/.env` configured with:
  ```bash
  CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
  FRONTEND_URL=http://localhost:3000
  ```
- Fast-path CORS middleware in FastAPI validates `localhost:3000` origin with full header support.

---

## 15. End-to-End Test Results
- **Backend Tests:** `42 / 42 passed` (100%) in `pytest tests`.
- **TypeScript Check:** `npx tsc --noEmit` passed with `0 errors`.
- **Next.js Production Build:** `npm run build` completed successfully, compiling all 18 routes.
- **Multilingual Validation Scripts:**
  - `check-translations.mjs`: 100% native coverage across all 23 languages.
  - `validate-language-isolation.mjs`: Passed with zero cross-contamination.
  - `verify-all-pages-multilingual.mjs`: All 23 languages × 21 targets passed.
- **Live Browser Verification:** Verified Assistant query submission, backend inference, and case workspace rendering via browser subagent.

---

## 16. Remaining Limitations
1. **Live BHASHINI Cloud Credentials:** When BHASHINI cloud credentials are not supplied in `.env`, the platform operates in local Web Speech API fallback mode (by design, to avoid fabricated responses).
2. **PostgreSQL vs. SQLite in Dev:** Development uses SQLite (`ipsakti.db`) with custom cross-dialect UUID and JSON support. For production deployments, configuring `DATABASE_URL` to a PostgreSQL + pgvector instance is supported natively by the existing SQLAlchemy configuration.
