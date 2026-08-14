# User Flows — AI Code Reviewer & Bug Detection Platform

## 1. Registration Flow

```text
Landing
  ↓
Register
  ↓
Enter name/email/password
  ↓
Validate
  ↓
Create account
  ↓
Login/session created
  ↓
Dashboard
```

Alternative:
```text
Register
  ↓
Continue with Google
  ↓
Google OAuth
  ↓
Callback
  ↓
Dashboard
```

## 2. Manual Code Review

```text
Dashboard
  ↓
New Code Review
  ↓
Select/Create Project
  ↓
Select Language
  ↓
Enter/Paste Code
  ↓
Analyze
  ↓
Review queued
  ↓
Static analysis
  ↓
AI analysis
  ↓
Score + Issues
  ↓
Review Result
```

## 3. Understand an Issue

```text
Review Result
  ↓
Select Issue
  ↓
Issue Details
  ↓
Read explanation
  ↓
Ask AI
  ↓
AI explanation
```

## 4. Generate Fix

```text
Issue Details
  ↓
Generate Fix
  ↓
AI generates patch
  ↓
Show diff
  ↓
Accept / Reject
  ↓
If accepted:
update working code
  ↓
Re-analyze
  ↓
New score
```

## 5. Upload Project

```text
New Review
  ↓
Upload ZIP
  ↓
Validate size/type
  ↓
Extract into isolated workspace
  ↓
Detect files/languages
  ↓
Run analyzers
  ↓
AI analysis
  ↓
Result
```

## 6. GitHub Connection

```text
GitHub Page
  ↓
Connect GitHub
  ↓
OAuth
  ↓
Grant permissions
  ↓
Callback
  ↓
Store encrypted token
  ↓
List repositories
```

## 7. Repository Review

```text
GitHub
  ↓
Select repository
  ↓
Select branch
  ↓
Analyze
  ↓
Clone/fetch into isolated workspace
  ↓
Static analysis
  ↓
AI analysis
  ↓
Result
```

## 8. Pull Request Review

```text
Repository
  ↓
Pull Requests
  ↓
Select PR
  ↓
Review PR
  ↓
Get changed files
  ↓
Analyze changes
  ↓
Generate findings
  ↓
Show AI review
  ↓
Developer approves comments
  ↓
Publish comments to GitHub
```

Never automatically publish AI comments in MVP without explicit user approval.

## 9. Review History

```text
Reviews
  ↓
Filter/search
  ↓
Select review
  ↓
View result
  ↓
Compare previous review
```

## 10. Delete Data

```text
Settings/Project
  ↓
Delete
  ↓
Confirmation
  ↓
Delete related reviews/files
  ↓
Remove temporary data
  ↓
Success
```

## 11. Error Flow
Every long-running operation must support:
- Loading
- Retry
- Failed state
- Clear error message
- Request ID for support/debugging where appropriate
