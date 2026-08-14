# Roles & Permissions — AI Code Reviewer & Bug Detection Platform

## 1. Roles

### USER
Default role for registered developers.

### ADMIN
Platform administrator.

## 2. USER Permissions

### Account
- View own profile
- Update own profile
- Change password
- Connect/disconnect GitHub

### Projects
- Create project
- View own projects
- Update own projects
- Delete own projects

### Reviews
- Create reviews
- View own reviews
- Re-run own reviews
- Delete own reviews

### Issues
- View issues in own reviews
- Generate AI explanation
- Generate AI fixes
- Change issue status

### GitHub
- Connect own GitHub account
- View authorized repositories
- Review authorized repositories/PRs
- Publish comments only after explicit approval

### Analytics
- View own analytics

## 3. ADMIN Permissions
Admins can:
- View platform health
- View users
- Disable/enable accounts
- View usage metrics
- View audit logs
- Manage system configuration
- Manage AI/analyzer settings
- Review system errors

Admins should not automatically have access to private source code unless the product's privacy policy explicitly permits it and the action is audited.

## 4. Authorization Rules
Every protected resource must verify ownership.

Example:
```text
GET /reviews/:id

1. Authenticate user
2. Fetch review
3. Verify review.user_id == authenticated user ID
4. Return review
```

Never rely on frontend hiding UI elements as authorization.

## 5. Permission Matrix

| Resource | USER | ADMIN |
|---|---:|---:|
| Own Profile | CRUD | CRUD |
| Own Projects | CRUD | CRUD |
| Own Reviews | CRUD | Read/Support |
| Own Issues | CRUD status | Read/Support |
| AI Analysis | Use | Configure |
| GitHub Connection | CRUD own | Support |
| Analytics | Own | Platform |
| Users | No | CRUD |
| Audit Logs | No | Read |
| System Settings | No | CRUD |

## 6. Security
- JWT authentication
- Password hashing
- OAuth state validation
- Resource ownership checks
- Rate limiting
- Audit sensitive admin actions
- Do not expose admin endpoints to regular users
