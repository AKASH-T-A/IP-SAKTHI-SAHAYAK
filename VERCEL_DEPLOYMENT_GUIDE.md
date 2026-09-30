# 🚀 IP-SAKTI SAHAYAK — Vercel Deployment Guide
## SIH26045 | Intellectual Property & Regulatory Decision Support Platform for Ayurveda

---

### 📋 Overview

This guide provides step-by-step instructions to deploy the **IP-SAKTI SAHAYAK** platform to **Vercel** via GitHub integration or the Vercel CLI.

- **Frontend:** Next.js 16.3 (React 19, TypeScript, Turbopack, App Router) -> **Vercel**
- **Backend:** FastAPI (Python 3.12, Uvicorn, SQLAlchemy) -> **Render / Railway / AWS / Vercel Serverless**

---

### 🛠 Method 1: Deploying via Vercel Dashboard (Recommended)

#### Step 1: Push Project to GitHub
Ensure your latest code is pushed to your GitHub repository:
```bash
git add .
git commit -m "chore: configure vercel deployment"
git push origin main
```

#### Step 2: Import Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Import your GitHub repository (`IP-SAKTI-SAHAYAK`).
3. In the **Configure Project** screen:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Edit and select `frontend` (Click *Edit* next to Root Directory and choose `frontend`).
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### Step 3: Configure Environment Variables in Vercel
Add the following key-value pairs in **Environment Variables**:

| Key | Example Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-api.onrender.com/api/v1` | URL of deployed FastAPI backend |
| `NEXT_PUBLIC_APP_ENV` | `production` | Environment flag |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | `false` (or `true` for standalone demo) | Enable offline fallback |

#### Step 4: Click Deploy
Click **Deploy**. Vercel will automatically build and publish your Next.js frontend with an SSL-enabled domain (e.g., `https://ip-sakti-frontend.vercel.app`).

---

### 💻 Method 2: Deploying via Vercel CLI

#### Step 1: Install & Login to Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### Step 2: Deploy Frontend
Navigate to the `frontend` directory and deploy:
```bash
cd frontend
vercel
```
Follow the interactive prompts:
- **Set up and deploy?** `Y`
- **Which scope?** (Select your personal or team account)
- **Link to existing project?** `N`
- **What's your project's name?** `ip-sakti-frontend`
- **In which directory is your code located?** `./`
- **Auto-detected Project Settings:** Press `Y` to confirm Next.js preset.

#### Step 3: Deploy to Production
```bash
vercel --prod
```

---

### ⚙️ Python FastAPI Backend Deployment Options

Since FastAPI requires a Python runtime, you can deploy the backend alongside your Vercel frontend using one of the following methods:

#### Option A: Render (Free Tier Available — Recommended)
1. Sign up at [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables (`DATABASE_URL`, `OPENAI_API_KEY`, `CORS_ORIGINS`).
6. Update `NEXT_PUBLIC_API_URL` in Vercel with your Render service URL!

#### Option B: Railway / Fly.io
1. Create a project at [Railway.app](https://railway.app).
2. Deploy from GitHub repository selecting the `backend` folder.
3. Railway automatically detects Python and starts Uvicorn.

---

### 🔍 Post-Deployment Health Verification

Once both services are deployed:
1. Open your Vercel URL (e.g. `https://ip-sakti.vercel.app`).
2. Test critical routes:
   - `/dashboard` — Main Hub
   - `/search` — Prior Art Search
   - `/claims` — Novelty & Patentability Assessment
   - `/formulations` — TKDL & Classical Formulation Checker
   - `/patentability` — Statutory Section 3(p) Evaluation
3. Check browser dev console Network tab to verify API calls connect to `NEXT_PUBLIC_API_URL`.

---

### 📁 Config Summary Files Created
- [`frontend/vercel.json`](file:///c:/Users/akash/OneDrive/Desktop/SAKTHI-SIH/frontend/vercel.json)
- [`vercel.json`](file:///c:/Users/akash/OneDrive/Desktop/SAKTHI-SIH/vercel.json)
- [`VERCEL_DEPLOYMENT_GUIDE.md`](file:///c:/Users/akash/OneDrive/Desktop/SAKTHI-SIH/VERCEL_DEPLOYMENT_GUIDE.md)
