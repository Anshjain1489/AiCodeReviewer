# AI Code Reviewer & Bug Detection Platform

A production-quality web platform that empowers software developers and engineering teams to analyze source code, detect security vulnerabilities, identify performance bugs, understand root causes, generate automated AI fixes with side-by-side diffs, and review GitHub repositories and Pull Requests with developer approval workflows.

---

## Architecture Overview

```text
Browser (React + Vite + Tailwind CSS + Monaco Editor)
   │
   │ HTTPS REST API (/api/v1)
   ▼
Node.js / Express Backend (Modular Monolith)
   │
   ├─► Security & Auth (JWT, bcrypt, Helmet, CORS Allowlist, Rate Limiting)
   ├─► Prisma ORM ──► PostgreSQL (Supabase / Local Docker)
   ├─► Static Analysis Engine (ESLint + Semgrep + Rule Engine)
   ├─► AI Engine Abstraction (Google Gemini 1.5 Pro/Flash + OpenAI + Mock Dev Provider)
   ├─► Scoring Engine (Security 25%, Bugs 25%, Maintainability 20%, Performance 15%, Quality 15%)
   └─► GitHub Integration (OAuth, Repositories, Branches, PRs, Developer Approval Workflow)
```

---

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS (Dark-first IDE theme), React Router v6, Axios, `@monaco-editor/react`, `recharts`, `lucide-react`.
- **Backend**: Node.js, Express.js, Prisma ORM, Winston logger, Helmet, CORS, `express-rate-limit`, `bcryptjs`, `jsonwebtoken`.
- **Database**: PostgreSQL (Supabase PostgreSQL / Docker PostgreSQL).
- **Static Analysis**: ESLint programmatic API, Semgrep CLI adapter, Rule Engine.
- **AI Abstraction**: Google Gemini (`@google/generative-ai`), OpenAI (`openai`), Development Mock Provider (`mock`).
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD.

---

## Key Features

1. **Monaco Editor Workspace**: Interactive code editor supporting syntax highlighting, line numbers, and file upload.
2. **Deterministic Static + AI Analysis**: Combines ESLint and Semgrep rules with AI context reasoning.
3. **Deterministic Scoring Engine**: Configurable sub-scores and overall score (0-100) with grade cards (A, B, C, D, F).
4. **Issue Explorer & AI Explanations**: Detailed problem descriptions, security impact, recommendations, and AI explanation drawer.
5. **AI Fix Generation & Diff Viewer**: Side-by-side original vs suggested fix code diffs with "Accept Fix & Re-analyze" pipeline.
6. **Review AI Chat**: Contextual AI assistant conversation per review.
7. **GitHub Integration**: Connect account, browse repositories, select branches, analyze remote codebases.
8. **Pull Request Review & Manual Approval**: Analyze changed PR files, generate review feedback, require explicit developer approval before posting comments to GitHub API.
9. **Developer Dashboard & Analytics**: Recharts visualizations for score trends, severity distribution, and category breakdown.
10. **Untrusted Code Isolation**: Isolated temporary workspace execution preventing unauthorized host command execution.

---

## Local Setup & Quickstart

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose (Optional for local DB/Redis)

### 1. Database Setup
Ensure PostgreSQL is running locally or via Docker:
```bash
docker-compose up -d postgres redis
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run at `http://localhost:3000` and connect to the backend at `http://localhost:5000/api/v1`.

---

## Running Tests

### Backend Tests (Jest & Supertest)
```bash
cd backend
npm test
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```

---

## Environment Variables

### Backend (`backend/.env`)
```text
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/aicode_reviewer?schema=public"
DIRECT_URL="postgresql://postgres:postgrespassword@localhost:5432/aicode_reviewer?schema=public"

JWT_SECRET=super_secret_jwt_key_for_ai_code_reviewer_dev_mode_32chars
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/github/callback

# AI Provider options: gemini | openai | mock
AI_PROVIDER=mock
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```text
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Untrusted Code Isolation Strategy

To prevent security risks when analyzing untrusted code uploads or repository archives:
1. **Isolated Workspaces**: Extracted archives run in temporary directories (`temp_workspaces/`) outside process execution paths.
2. **Resource Limits**: File count cap (500 files), extracted size cap (50MB), path traversal rejection (`..` path detection).
3. **No Dynamic Execution**: Code is parsed strictly via static AST and LLM prompt tokens; source code is never dynamically required (`eval`/`require`) inside the API process.
4. **Workspace Cleanup**: Temporary directories are force-purged immediately upon review completion.

---

## Production Deployment

- **Frontend**: Deploy to **Vercel** (`npm run build`). Set `VITE_API_URL`.
- **Backend**: Deploy to **Render** (`node src/server.js`). Set `process.env.PORT` dynamically and configure CORS allowlist.
- **Database**: Host PostgreSQL on **Supabase**. Apply migrations with `npx prisma migrate deploy`.
