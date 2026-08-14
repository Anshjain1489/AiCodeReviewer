# Deployment — AI Code Reviewer & Bug Detection Platform

## 1. Production Architecture

```text
User
 |
 v
Vercel
React Frontend
 |
 | HTTPS
 v
Render
Node.js + Express API
 |
 +--------+---------+
 |                  |
 v                  v
Supabase           Redis
PostgreSQL
 |
 v
Analysis Worker
 |
 +--> ESLint
 +--> Semgrep
 |
 v
AI Provider
Gemini/OpenAI

GitHub API
   ^
   |
Render Backend
```

## 2. Frontend Deployment
Host:
- Vercel

Build:
```bash
npm install
npm run build
```

Environment variables:
```text
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

Never place private API keys in VITE_ variables.

## 3. Backend Deployment
Host:
- Render

Build:
```bash
npm install
```

Start:
```bash
npm start
```

Recommended production command:
```bash
node src/server.js
```

The server must listen on:
```text
process.env.PORT
```

## 4. Backend Environment Variables

```text
NODE_ENV=production
PORT=10000

DATABASE_URL=...
DIRECT_URL=...

JWT_SECRET=...
JWT_EXPIRES_IN=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=...

AI_PROVIDER=gemini
GEMINI_API_KEY=...

OPENAI_API_KEY=...

REDIS_URL=...

FRONTEND_URL=https://your-frontend.vercel.app
```

Only configure the AI provider actually being used.

## 5. Database
Use Supabase PostgreSQL.

Production workflow:
```text
Local development
      ↓
Prisma migration
      ↓
Test database
      ↓
CI tests
      ↓
Production migration
```

Never manually edit production schema without a migration.

## 6. Redis
Use Redis for:
- Rate limiting
- Caching
- Background jobs if enabled
- Temporary review status

Do not store critical permanent data only in Redis.

## 7. Docker
Use Docker for:
- Local development
- Consistent analyzer environment
- Isolated static analysis workers

Production analysis workers should run in a restricted environment.

## 8. GitHub Actions

Pipeline:

```text
Push/PR
  ↓
Install dependencies
  ↓
Lint
  ↓
Unit tests
  ↓
Integration tests
  ↓
Build frontend
  ↓
Build backend
  ↓
Security checks
```

Production deployment can then be triggered after successful checks.

## 9. CORS
Allow only configured frontend origins.

Example:
```text
https://your-frontend.vercel.app
```

Do not use:
```text
*
```
for authenticated production APIs.

## 10. Security Headers
Use Helmet.

Enable:
- Content Security Policy where practical
- X-Content-Type-Options
- Referrer Policy
- Frame protection

## 11. File Upload Security
For ZIP/project uploads:
- Limit file size
- Allow only supported archive types
- Prevent path traversal
- Reject symbolic-link abuse
- Limit extracted file count
- Limit extracted total size
- Scan/analyze in isolated workspace
- Delete temporary files after review

## 12. Logging
Production logs should include:
- timestamp
- level
- request ID
- route
- duration
- error code

Never log:
- passwords
- JWT secrets
- OAuth tokens
- AI API keys
- raw private source code

## 13. Health Check
Render should use:

```text
GET /api/v1/health
```

Expected:
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## 14. Deployment Environments

### Development
- Local React
- Local Node.js
- Supabase development database
- Local Redis

### Staging
- Vercel preview
- Render staging service
- Staging database
- Test AI credentials

### Production
- Vercel production
- Render production
- Supabase production
- Production Redis
- Production AI credentials

## 15. Backup & Recovery
- Enable Supabase backups
- Keep database migration history in Git
- Do not rely on source-code backups for secrets
- Document recovery procedures

## 16. Deployment Checklist
- Environment variables configured
- Database migrations applied
- CORS configured
- OAuth callback URLs configured
- GitHub OAuth configured
- AI API configured
- Redis configured
- Health endpoint working
- Frontend API URL correct
- HTTPS enabled
- GitHub Actions passing
- Logs monitored
