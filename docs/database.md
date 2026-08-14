# Database Design — AI Code Reviewer & Bug Detection Platform

## 1. Database
Use PostgreSQL hosted on Supabase.

ORM:
- Prisma

## 2. Core Entities

```text
User
 ├── Project
 │    ├── ProjectFile
 │    └── Review
 │         ├── ReviewIssue
 │         │    └── IssueFix
 │         └── AIConversation
 │
 └── GitHubConnection
      └── PullRequest
```

## 3. Tables

### users
- id UUID PK
- name
- email UNIQUE
- password_hash nullable
- avatar_url nullable
- provider nullable
- role
- is_active
- created_at
- updated_at

### projects
- id UUID PK
- user_id FK
- name
- description nullable
- language nullable
- repository_url nullable
- created_at
- updated_at

### project_files
- id UUID PK
- project_id FK
- path
- language
- size_bytes
- content_hash
- created_at

Do not permanently store raw source code unless explicitly required by product settings.

### reviews
- id UUID PK
- project_id FK
- user_id FK
- source_type
- commit_sha nullable
- branch_name nullable
- status
- overall_score nullable
- security_score nullable
- bug_score nullable
- performance_score nullable
- maintainability_score nullable
- quality_score nullable
- total_issues
- started_at
- completed_at
- created_at

### review_issues
- id UUID PK
- review_id FK
- file_path
- line_start nullable
- line_end nullable
- column_start nullable
- column_end nullable
- category
- severity
- title
- description
- impact nullable
- recommendation nullable
- rule_id nullable
- source
- fingerprint
- status
- created_at

### issue_fixes
- id UUID PK
- issue_id FK
- original_code
- suggested_code
- explanation
- status
- created_at

### ai_conversations
- id UUID PK
- user_id FK
- review_id FK
- title nullable
- created_at
- updated_at

### ai_messages
- id UUID PK
- conversation_id FK
- role
- content
- token_usage nullable
- created_at

### github_connections
- id UUID PK
- user_id FK
- github_user_id
- username
- encrypted_access_token
- scopes
- created_at
- updated_at

### github_repositories
- id UUID PK
- connection_id FK
- github_repo_id
- owner
- name
- full_name
- default_branch
- private
- html_url
- created_at
- updated_at

### pull_requests
- id UUID PK
- repository_id FK
- github_pr_id
- number
- title
- branch_name
- base_branch
- commit_sha
- status
- review_id nullable
- created_at
- updated_at

### usage_records
- id UUID PK
- user_id FK
- action
- units
- metadata JSONB
- created_at

### audit_logs
- id UUID PK
- user_id nullable
- action
- resource_type
- resource_id nullable
- ip_hash nullable
- metadata JSONB
- created_at

## 4. Enums

### review_status
- QUEUED
- RUNNING
- COMPLETED
- FAILED
- CANCELLED

### issue_severity
- CRITICAL
- HIGH
- MEDIUM
- LOW
- INFO

### issue_category
- BUG
- SECURITY
- PERFORMANCE
- QUALITY
- MAINTAINABILITY
- COMPLEXITY
- BEST_PRACTICE

### issue_status
- OPEN
- FIXED
- IGNORED
- ACCEPTED

## 5. Relationships
- User 1:N Project
- Project 1:N ProjectFile
- Project 1:N Review
- Review 1:N ReviewIssue
- ReviewIssue 1:N IssueFix
- Review 1:N AIConversation
- AIConversation 1:N AIMessage
- User 1:N GitHubConnection
- GitHubConnection 1:N GitHubRepository
- GitHubRepository 1:N PullRequest

## 6. Indexes
Create indexes for:
- users.email
- projects.user_id
- reviews.project_id
- reviews.user_id
- reviews.status
- review_issues.review_id
- review_issues.severity
- review_issues.category
- review_issues.fingerprint
- pull_requests.repository_id
- usage_records.user_id
- audit_logs.user_id
- created_at fields used for dashboard queries

## 7. Data Privacy
- Never log passwords.
- Never log OAuth access tokens.
- Encrypt GitHub tokens.
- Minimize source-code persistence.
- Allow users to delete projects/reviews.
- Remove temporary analysis artifacts after completion.
