# Pages & Routes — AI Code Reviewer & Bug Detection Platform

## Public Pages

### 1. Landing Page
Route:
```text
/
```
Sections:
- Hero
- Product explanation
- Features
- How it works
- Security
- CTA
- Footer

### 2. Login
Route:
```text
/login
```

### 3. Register
Route:
```text
/register
```

### 4. Forgot Password
Route:
```text
/forgot-password
```

### 5. Reset Password
Route:
```text
/reset-password
```

## Protected Pages

### 6. Dashboard
Route:
```text
/dashboard
```

### 7. Projects
Route:
```text
/projects
```

### 8. Project Details
Route:
```text
/projects/:projectId
```

### 9. New Review
Route:
```text
/reviews/new
```

### 10. Review Result
Route:
```text
/reviews/:reviewId
```

### 11. Issue Details
Route:
```text
/reviews/:reviewId/issues/:issueId
```

### 12. Review History
Route:
```text
/reviews
```

### 13. GitHub
Route:
```text
/github
```

### 14. Repository
Route:
```text
/github/repositories/:repositoryId
```

### 15. Pull Requests
Route:
```text
/github/repositories/:repositoryId/pulls
```

### 16. Pull Request Review
Route:
```text
/github/pulls/:pullRequestId
```

### 17. Analytics
Route:
```text
/analytics
```

### 18. Settings
Route:
```text
/settings
```

Settings tabs:
- Profile
- Security
- AI preferences
- GitHub
- Notifications
- Privacy

## Error Pages

### 404
```text
/404
```

### Unauthorized
```text
/unauthorized
```

## Navigation
Main sidebar:
- Dashboard
- Projects
- Reviews
- GitHub
- Analytics
- Settings

Primary CTA:
- New Code Review

## Route Protection
Unauthenticated users cannot access protected routes.

Users can only access projects, reviews, and GitHub resources they own or are authorized to access.
