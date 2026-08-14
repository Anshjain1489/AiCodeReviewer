# Testing Strategy — AI Code Reviewer & Bug Detection Platform

## 1. Testing Goals
Ensure:
- Authentication is secure
- Review pipeline is reliable
- Analyzer results are normalized correctly
- AI failures do not break the application
- Users cannot access another user's data
- GitHub integration is safe
- UI works across supported devices

## 2. Backend Unit Tests
Use:
- Jest

Test:
- Auth services
- Score calculator
- Issue normalization
- Review service
- Permission checks
- Validation
- AI provider adapter
- GitHub service logic

## 3. API Integration Tests
Use:
- Supertest
- Test PostgreSQL database

Test:
- Register/login
- Protected routes
- Project CRUD
- Review creation
- Review retrieval
- Issue retrieval
- Fix generation
- GitHub endpoints
- Error responses

## 4. Database Tests
Use Prisma migrations against a test database.

Verify:
- Constraints
- Unique email
- Foreign keys
- Cascade behavior
- Indexes
- Transaction behavior

## 5. Frontend Tests
Use:
- Vitest
- React Testing Library

Test:
- Login form
- Register form
- Protected routes
- Dashboard rendering
- Review editor
- Issue filtering
- Issue details
- Loading/error states
- GitHub repository UI

## 6. End-to-End Tests
Use Playwright.

Critical scenarios:
1. Register/login
2. Create project
3. Submit JavaScript code
4. Complete review
5. Open issue
6. Generate fix
7. Re-analyze
8. View history
9. Connect GitHub in mocked test environment

## 7. Security Tests
Test:
- Broken access control
- JWT validation
- Rate limiting
- CORS
- XSS
- SQL injection through API inputs
- File upload abuse
- Path traversal
- OAuth state validation
- Secret leakage
- IDOR

## 8. Analyzer Tests
Maintain fixtures:

```text
tests/analyzers/
├── javascript/
│   ├── vulnerable-sql.js
│   ├── xss.js
│   └── clean.js
└── common/
```

Each fixture should have expected normalized findings.

## 9. AI Testing
Do not require exact AI text equality.

Test:
- Required structured fields exist
- Valid severity/category
- Valid JSON schema
- No unsupported claims where deterministic evidence exists
- Provider timeout handling
- Retry handling
- Token/usage tracking

Use mocked AI responses in automated tests.

## 10. Performance Tests
Measure:
- API latency
- Review creation latency
- Analyzer duration
- AI latency
- Database query performance
- Concurrent review jobs

## 11. Acceptance Criteria
A feature is complete when:
- Happy path works
- Validation works
- Authorization works
- Error state works
- Loading state works
- Tests pass
- No secrets are exposed
- Documentation is updated
