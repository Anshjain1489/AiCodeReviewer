# API Specification — AI Code Reviewer & Bug Detection Platform

## 1. API Standards
Base URL:

```text
/api/v1
```

Authentication:
```text
Authorization: Bearer <JWT>
```

Response format:

```json
{
  "success": true,
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

## 2. Authentication

### POST /auth/register
Create an account.

Request:
```json
{
  "name": "Ansh",
  "email": "user@example.com",
  "password": "********"
}
```

### POST /auth/login
Login and return access token.

### POST /auth/refresh
Refresh authentication if refresh-token architecture is enabled.

### POST /auth/logout
Invalidate session/refresh token.

### GET /auth/me
Return current user.

### GET /auth/google
Start Google OAuth.

### GET /auth/google/callback
Handle OAuth callback.

## 3. Projects

### GET /projects
List user's projects.

### POST /projects
Create project.

### GET /projects/:id
Get project details.

### PATCH /projects/:id
Update project.

### DELETE /projects/:id
Delete project.

## 4. Reviews

### POST /reviews
Create a review.

Request:
```json
{
  "projectId": "uuid",
  "language": "javascript",
  "code": "const x = 10;"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "status": "QUEUED"
  }
}
```

### GET /reviews
List reviews.

Query:
```text
?page=1&limit=20&status=COMPLETED
```

### GET /reviews/:id
Get review summary.

### GET /reviews/:id/issues
Get issues.

Filters:
```text
severity
category
status
filePath
```

### POST /reviews/:id/reanalyze
Re-run review.

### DELETE /reviews/:id
Delete review.

## 5. Issues

### GET /issues/:id
Get issue details.

### PATCH /issues/:id
Update issue status.

### POST /issues/:id/explain
Generate AI explanation.

### POST /issues/:id/fix
Generate suggested fix.

### POST /issues/:id/accept-fix
Mark suggested fix as accepted.

## 6. AI Chat

### POST /reviews/:id/chat
Ask AI about a review.

Request:
```json
{
  "message": "Why is this issue dangerous?"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "..."
  }
}
```

## 7. GitHub

### GET /github/connect
Start GitHub OAuth.

### GET /github/callback
OAuth callback.

### GET /github/repositories
List repositories.

### GET /github/repositories/:id/branches
List branches.

### POST /github/repositories/:id/review
Analyze repository/branch.

### GET /github/repositories/:id/pulls
List pull requests.

### POST /github/pulls/:id/review
Review pull request.

### POST /github/pulls/:id/comments
Publish approved review comments.

## 8. Dashboard

### GET /dashboard/summary
Return:
- total reviews
- total issues
- critical issues
- average score

### GET /dashboard/trends
Return score trend.

### GET /dashboard/issues
Return issue distribution.

## 9. Health

### GET /health
Return API health.

Response:
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## 10. Security
- Validate every request.
- Authenticate protected routes.
- Authorize resource ownership.
- Rate-limit AI endpoints.
- Rate-limit authentication endpoints.
- Never trust client-provided user IDs.
- Sanitize GitHub callback/state handling.
- Do not expose internal analyzer output directly without normalization.
