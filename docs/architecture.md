# Architecture — AI Code Reviewer & Bug Detection Platform

## 1. Architecture Style
Use a modular monolith for the first production version.

Frontend and backend are separate applications:
- React frontend
- Node.js/Express backend

The backend should be organized by feature/domain rather than a large flat controller structure.

## 2. High-Level Architecture

```text
Browser
   |
   v
React + Vite
   |
   | HTTPS REST API
   v
Node.js + Express
   |
   +--------------------+
   |                    |
   v                    v
PostgreSQL            Redis
Supabase              cache/rate limits/jobs
   |
   v
Prisma ORM

Review Service
   |
   +--> Static Analysis Adapter
   |      +--> ESLint
   |      +--> Semgrep
   |
   +--> AI Service
   |      +--> Gemini
   |      +--> OpenAI
   |
   +--> Issue Normalizer
   |
   +--> Score Calculator
   |
   +--> Fix Generator

GitHub Service
   |
   +--> GitHub OAuth
   +--> Repositories
   +--> Branches
   +--> Pull Requests
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
- Axios for HTTP
- Context API for authentication/global lightweight state
- Local component state for page-specific state
- Avoid unnecessary global state libraries in MVP

## 4. Backend Architecture

```text
src/
├── config/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middleware/
├── validators/
├── analyzers/
├── integrations/
├── utils/
└── app.js
```

### Responsibilities
Controllers:
- Receive HTTP requests
- Validate request shape
- Call services
- Return HTTP responses

Services:
- Business logic
- Review orchestration
- AI orchestration
- GitHub workflows

Repositories:
- Database access through Prisma

Analyzers:
- Adapters around ESLint/Semgrep/custom rules

Integrations:
- GitHub
- AI providers

## 5. Review Pipeline

```text
Submit Code
    |
    v
Create Review
    |
    v
Store Source/Metadata
    |
    v
Static Analysis
    |
    v
Normalize Findings
    |
    v
AI Analysis
    |
    v
Deduplicate/Rank Findings
    |
    v
Calculate Score
    |
    v
Persist Result
    |
    v
Return Review
```

## 6. AI Provider Abstraction

Create an interface-like service:

```text
AIProvider
├── analyzeCode()
├── explainIssue()
├── generateFix()
└── chatAboutReview()
```

Implement provider adapters:
- GeminiProvider
- OpenAIProvider

The rest of the application must not depend directly on provider-specific SDK calls.

## 7. Analyzer Abstraction

```text
Analyzer
├── analyze()
├── getName()
└── getSupportedLanguages()
```

Implement:
- ESLintAnalyzer
- SemgrepAnalyzer
- Future analyzers

## 8. Security Architecture
- HTTPS in production
- JWT access tokens
- Secure password hashing
- OAuth token encryption at rest
- Request validation
- Rate limiting
- CORS allowlist
- Helmet security headers
- File type and size validation
- Temporary source files must be isolated
- Never execute arbitrary user code in the API process
- Sanitize rendered code/AI output
- Do not expose secrets to frontend

## 9. Untrusted Code Isolation
Static analysis of uploaded projects must happen outside the main API process.

Preferred approach:
```text
API
 |
 v
Analysis Job
 |
 v
Isolated Worker/Container
 |
 +--> ESLint
 +--> Semgrep
 |
 v
Normalized Results
 |
 v
API/Database
```

For MVP, analysis may be implemented as a controlled worker process, but production should use container isolation.

## 10. Scalability
Start with a modular monolith. Extract services only when necessary:
- Analysis workers
- AI worker
- GitHub worker

Redis can support:
- Rate limiting
- Job queues
- Caching
- Temporary state

## 11. Error Handling
Use a standard error shape:

```json
{
  "success": false,
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "message": "Review was not found"
  }
}
```

Never return stack traces or secrets to clients.

## 12. Observability
Track:
- API errors
- Review duration
- AI latency
- Analyzer failures
- GitHub API failures
- Queue failures
- Authentication failures

Use structured logs with request IDs.
