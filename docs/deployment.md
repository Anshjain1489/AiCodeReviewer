# Deployment — AI Code Reviewer & Bug Detection Platform

## 1. Production Architecture

```text
User Browser
   │
   ▼
Vercel
React Frontend
   │
   │ HTTPS REST API
   ▼
Render
Node.js + Express API
   │
   ├─► Firebase Admin SDK ──► Firebase Cloud Firestore
   ├─► Static Analysis (ESLint + Semgrep)
   ├─► AI Engine (Google Gemini / OpenAI)
   └─► GitHub API Integration
```

## 2. Frontend Deployment (Vercel)
- **Host**: Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://your-backend.onrender.com/api/v1`

---

## 3. Backend Deployment (Render)
- **Host**: Render Web Service
- **Build Command**: `npm install`
- **Start Command**: `node src/server.js`

### Required Backend Environment Variables:
```text
NODE_ENV=production
PORT=10000

FIREBASE_PROJECT_ID=ai-code-reviewer-e0b62
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ai-code-reviewer-e0b62.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

JWT_SECRET=super_secret_jwt_key_for_ai_code_reviewer_prod_32chars
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/v1/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-backend.onrender.com/api/v1/github/callback

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key

FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 4. Database Setup (Firebase Cloud Firestore)
- Create a Firebase Project on Firebase Console (`ai-code-reviewer-e0b62`).
- Enable Cloud Firestore in Production Mode.
- Create Service Account in Project Settings -> Service Accounts.
- Copy `project_id`, `client_email`, and `private_key` into Render environment variables.
- Deploy indexes using `firebase deploy --only firestore:indexes`.

---

## 5. Security & Isolation
- Firebase Admin SDK credentials remain isolated in Render server environment variables.
- Direct client access from browser to Firestore is blocked by `firestore.rules`.
- Application-level authentication (JWT + bcrypt) is enforced in Node.js Express.
