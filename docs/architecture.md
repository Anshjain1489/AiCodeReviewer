# Architecture — AI Code Reviewer & Bug Detection Platform

## 1. Architecture Style
Use a modular monolith for the application backend with clean separation of concerns:

Frontend and backend are separate applications:
- React frontend (Vercel)
- Node.js/Express backend (Render)

The database layer uses Firebase Cloud Firestore accessed via the Firebase Admin SDK (`firebase-admin`).

## 2. High-Level Architecture

```text
Browser (React + Vite + Tailwind CSS + Monaco Editor)
   │
   │ HTTPS REST API (/api/v1)
   ▼
Node.js / Express Backend (Render)
   │
   ├─► Security & Auth (JWT, bcrypt, Helmet, CORS Allowlist, Rate Limiting)
   ├─► Database Access Layer (Firebase Admin SDK ──► Firebase Cloud Firestore)
   ├─► Static Analysis Engine (ESLint + Semgrep + Rule Engine)
   ├─► AI Engine Abstraction (Google Gemini 1.5 Pro/Flash + OpenAI + Mock Dev Provider)
   ├─► Scoring Engine (Security 25%, Bugs 25%, Maintainability 20%, Performance 15%, Quality 15%)
   └─► GitHub Integration (OAuth, Repositories, Branches, PRs, Developer Approval Workflow)
```

## 3. Frontend Architecture

```text
src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── context/
├── services/
├── routes/
├── utils/
├── constants/
└── assets/
```

Use:
- React Router for routing
- Axios for HTTP REST calls
- Context API for authentication/global lightweight state
- Local component state for page-specific state

## 4. Backend Architecture

```text
src/
├── config/             # Environment, Logger, Firebase Admin SDK configuration
├── controllers/        # Express HTTP request handlers
├── services/           # Business & domain logic (Review pipeline, AI, GitHub, Dashboard)
├── repositories/       # Firestore collection data access repositories
├── routes/             # REST route definitions
├── middleware/         # Auth JWT verification, Audit logger, Error handler, Rate limiter
├── validators/         # Request validation logic
├── analyzers/          # ESLint & Semgrep static code analysis engines
├── integrations/       # AI Providers (Gemini, OpenAI, Mock) & GitHub API Client
├── utils/              # Token encryption, Response formatters, Workspace cleaners
└── app.js
```

### Repositories Responsibility
Repositories handle all database access through Firebase Admin SDK (`db.collection(...)`):
- `userRepository.js` -> `users` collection
- `projectRepository.js` -> `projects` collection
- `reviewRepository.js` -> `reviews` collection
- `issueRepository.js` -> `reviewIssues` & `issueFixes` collections
- `githubRepository.js` -> `githubConnections`, `githubRepositories`, `pullRequests` collections

## 5. Review Pipeline

```text
Submit Code
    │
    ▼
Create Review (Firestore `reviews` document)
    │
    ▼
Static Analysis (ESLint + Semgrep)
    │
    ▼
AI Context Analysis (Gemini / OpenAI)
    │
    ▼
Deduplicate & Rank Findings
    │
    ▼
Calculate Score (Deterministic Engine)
    │
    ▼
Persist Findings & Scores (Firestore `reviewIssues`)
    │
    ▼
Return Response
```

## 6. Security Architecture
- HTTPS in production
- JWT access tokens (backend application auth)
- Bcrypt password hashing
- GitHub OAuth access token AES-256 encryption at rest
- Rate limiting & Helmet security headers
- Firebase Admin SDK private key protected on backend (never exposed to frontend)
- Firestore direct client access disabled (`firestore.rules`)
