# AI Code Reviewer & Bug Detection Platform — PRD

## 1. Product Overview
Build a web-based AI Code Reviewer and Bug Detection Platform that helps developers analyze source code, identify bugs and security issues, understand problems, and generate suggested fixes.

The platform should support:
- Manual code submission
- Project/file-based review
- AI-powered code review
- Static analysis
- Bug detection
- Security analysis
- Performance and code-quality analysis
- AI-generated fixes and explanations
- Review history
- GitHub repository integration
- Pull Request review
- Developer dashboard and analytics

## 2. Goals
1. Make code review faster for individual developers.
2. Combine deterministic static analysis with AI reasoning.
3. Explain issues in beginner-friendly language.
4. Provide actionable fixes instead of only reporting problems.
5. Allow developers to review GitHub repositories and pull requests.
6. Maintain review history and quality trends.

## 3. Target Users
- Students learning programming
- Junior developers
- Professional developers
- Freelancers
- Small development teams

## 4. Core Features

### Authentication
- Email/password registration and login
- Google OAuth
- JWT-based authentication
- Logout
- Password reset
- Profile management

### Code Review
- Monaco Editor
- Language selection
- Paste/write code
- Upload source files/project ZIP
- Run analysis
- Review progress state
- Result summary
- Issue list
- Code-quality score

### Issue Categories
- Bugs
- Security
- Performance
- Code quality
- Maintainability
- Complexity
- Best practices

### Severity
- Critical
- High
- Medium
- Low
- Info

### AI Features
- Explain issue
- Generate fix
- Refactor code
- Ask questions about review
- Compare original and fixed code
- Re-analyze after changes

### Static Analysis
Use deterministic tools where appropriate:
- ESLint for JavaScript
- Semgrep for security/general rules
- Custom rules for platform-specific checks

The architecture must allow additional analyzers later.

### GitHub
- GitHub OAuth
- Repository listing
- Branch selection
- Repository analysis
- Pull Request analysis
- Review comments
- Review status

## 5. Code Quality Score
Calculate an overall score using findings from static analysis and AI analysis.

Suggested dimensions:
- Security: 25%
- Bugs: 25%
- Maintainability: 20%
- Performance: 15%
- Code Quality: 15%

The exact scoring algorithm should be configurable.

## 6. Dashboard
Show:
- Total reviews
- Total issues
- Critical/high issues
- Average code score
- Recent reviews
- Score trend
- Issues by category
- Issues by severity
- Projects

## 7. Non-Functional Requirements
- Responsive desktop-first UI
- Secure authentication
- Rate limiting
- Input validation
- Structured error handling
- No arbitrary execution of untrusted source code on the main API server
- Analysis jobs should be isolated
- Source-code privacy
- Audit important security-sensitive actions
- API should be versioned

## 8. MVP Scope
MVP must include:
1. Authentication
2. Dashboard
3. Monaco code editor
4. JavaScript code review
5. ESLint/Semgrep integration
6. AI review
7. Issue list
8. Issue details
9. AI fix generation
10. Review history
11. PostgreSQL persistence

GitHub integration can be included immediately after the core review flow is stable.

## 9. Future Features
- More programming languages
- GitHub PR automation
- Team workspaces
- Organization accounts
- CI/CD integration
- Custom rules
- Usage-based billing
- Advanced analytics
- IDE extensions
- Slack/Discord notifications

## 10. Tech Stack
### Frontend
React.js, JavaScript, Vite, Tailwind CSS, Monaco Editor, React Router, Axios, Recharts.

### Backend
Node.js, Express.js, JavaScript, REST API.

### Database
PostgreSQL on Supabase, Prisma ORM.

### AI
Provider abstraction supporting Google Gemini and/or OpenAI.

### Analysis
ESLint, Semgrep, custom analyzer adapters.

### Infrastructure
Redis for caching/rate limiting/queue support where needed.

### Deployment
Frontend: Vercel.
Backend: Render.
Database: Supabase.
Source control: GitHub.
CI/CD: GitHub Actions.
