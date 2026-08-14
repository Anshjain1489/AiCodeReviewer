# Production Deployment Guide — AI Code Reviewer Platform

This guide details step-by-step production deployment to **Vercel** (Frontend), **Render** (Backend), and **Supabase** (PostgreSQL Database).

---

## 1. Database Production Setup (Supabase)

Your Supabase PostgreSQL database schema is managed via Prisma ORM.

### Deploy Schema Migrations
Run the following command locally or in your deployment pipeline to ensure all tables exist in production:

```bash
cd backend
npx prisma migrate deploy
```

Verify in your Supabase Dashboard that tables (`users`, `projects`, `reviews`, `review_issues`, `issue_fixes`, etc.) are present.

---

## 2. Backend Deployment (Render)

### Step-by-Step Render Setup:
1. Push your repository to **GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> Select **Web Service**.
3. Connect your GitHub repository.
4. Fill in the service details:
   - **Name**: `ai-code-reviewer-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node src/server.js`
   - **Health Check Path**: `/api/v1/health`

5. Add **Environment Variables** under the **Environment** tab:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your Supabase pooled connection string (`postgresql://postgres.oqlnkmzexmuleejifdic:...@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`)
   - `DIRECT_URL`: Your Supabase direct connection string (`postgresql://postgres.oqlnkmzexmuleejifdic:...@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`)
   - `JWT_SECRET`: Your 64-character secret key (`02830d64667ff533fc0f021108a90d498b6e05df7e794dc7623b9fbdc4c4ae54`)
   - `JWT_EXPIRES_IN`: `7d`
   - `AI_PROVIDER`: `gemini`
   - `GEMINI_API_KEY`: Your Gemini API key (`your_gemini_api_key_here`)
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://ai-code-reviewer.vercel.app`)

6. Deploy Web Service and note your Render URL (e.g. `https://ai-code-reviewer-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

### Step-by-Step Vercel Setup:
1. Log into [Vercel Dashboard](https://vercel.com/) -> Click **Add New...** -> Select **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add **Environment Variable**:
   - `VITE_API_URL`: `https://ai-code-reviewer-backend.onrender.com/api/v1` *(Replace with your actual Render backend URL)*

5. Click **Deploy**. Vercel will build the frontend and deploy it to a live production URL.

---

## 4. Post-Deployment Verification

1. **Verify Backend Health**:
   Visit `https://YOUR-RENDER-BACKEND.onrender.com/api/v1/health`.
   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "status": "ok",
       "service": "ai-code-reviewer-backend"
     }
   }
   ```

2. **Update Google OAuth Redirect Callback**:
   - Go to Google Cloud Console -> APIs & Services -> Credentials -> Your OAuth 2.0 Client ID.
   - Add Authorized JavaScript Origin: `https://YOUR-VERCEL-FRONTEND.vercel.app`
   - Add Authorized Redirect URI: `https://YOUR-RENDER-BACKEND.onrender.com/api/v1/auth/google/callback`

3. **Perform Live Code Review**:
   - Open your live Vercel URL -> Register -> Submit JavaScript code for review -> Verify live score & Gemini AI insights!
