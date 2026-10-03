# Database Design — AI Code Reviewer & Bug Detection Platform

## 1. Database Architecture
Database: **Firebase Cloud Firestore**  
Access Layer: **Node.js Express + Firebase Admin SDK (`firebase-admin`)**

Application-level authentication (JWT + bcrypt) remains enforced in the Express backend middleware. The Firebase Admin SDK accesses Firestore directly with service credentials without requiring Firebase Authentication.

---

## 2. Core Collections

```text
users
 ├── projects
 │    ├── projectFiles
 │    └── reviews
 │         ├── reviewIssues
 │         │    └── issueFixes
 │         └── aiConversations
 │              └── aiMessages
 │
 └── githubConnections
      └── githubRepositories
           └── pullRequests
```

---

## 3. Collections & Document Schema

### `users`
- `id`: string (UUID, Document ID)
- `name`: string
- `email`: string (normalized lowercase, unique)
- `passwordHash`: string (bcrypt hash, nullable for OAuth)
- `avatarUrl`: string (nullable)
- `provider`: string ("email" | "google")
- `role`: string ("USER" | "ADMIN")
- `isActive`: boolean
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

### `projects`
- `id`: string (UUID, Document ID)
- `userId`: string (FK to `users`)
- `name`: string
- `description`: string (nullable)
- `language`: string
- `repositoryUrl`: string (nullable)
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

### `projectFiles`
- `id`: string (UUID, Document ID)
- `projectId`: string (FK to `projects`)
- `path`: string
- `language`: string
- `sizeBytes`: number
- `contentHash`: string
- `createdAt`: Firestore Timestamp

### `reviews`
- `id`: string (UUID, Document ID)
- `projectId`: string (FK to `projects`, nullable)
- `userId`: string (FK to `users`)
- `sourceType`: string ("MANUAL" | "ZIP_UPLOAD" | "GITHUB_REPO" | "GITHUB_PR")
- `commitSha`: string (nullable)
- `branchName`: string (nullable)
- `status`: string ("QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED")
- `overallScore`: number (nullable)
- `securityScore`: number (nullable)
- `bugScore`: number (nullable)
- `performanceScore`: number (nullable)
- `maintainabilityScore`: number (nullable)
- `qualityScore`: number (nullable)
- `totalIssues`: number
- `code`: string (Text)
- `language`: string
- `startedAt`: Firestore Timestamp (nullable)
- `completedAt`: Firestore Timestamp (nullable)
- `createdAt`: Firestore Timestamp

### `reviewIssues`
- `id`: string (UUID, Document ID)
- `reviewId`: string (FK to `reviews`)
- `filePath`: string
- `lineStart`: number (nullable)
- `lineEnd`: number (nullable)
- `columnStart`: number (nullable)
- `columnEnd`: number (nullable)
- `category`: string ("BUG" | "SECURITY" | "PERFORMANCE" | "QUALITY" | "MAINTAINABILITY" | "COMPLEXITY" | "BEST_PRACTICE")
- `severity`: string ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO")
- `title`: string
- `description`: string
- `impact`: string (nullable)
- `recommendation`: string (nullable)
- `ruleId`: string (nullable)
- `source`: string
- `fingerprint`: string
- `status`: string ("OPEN" | "FIXED" | "IGNORED" | "ACCEPTED")
- `createdAt`: Firestore Timestamp

### `issueFixes`
- `id`: string (UUID, Document ID)
- `issueId`: string (FK to `reviewIssues`)
- `originalCode`: string
- `suggestedCode`: string
- `explanation`: string
- `status`: string ("OPEN" | "ACCEPTED" | "REJECTED")
- `createdAt`: Firestore Timestamp

### `aiConversations`
- `id`: string (UUID, Document ID)
- `userId`: string (FK to `users`)
- `reviewId`: string (FK to `reviews`)
- `title`: string (nullable)
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

### `aiMessages`
- `id`: string (UUID, Document ID)
- `conversationId`: string (FK to `aiConversations`)
- `role`: string ("user" | "assistant" | "system")
- `content`: string
- `tokenUsage`: number (nullable)
- `createdAt`: Firestore Timestamp

### `githubConnections`
- `id`: string (UUID, Document ID)
- `userId`: string (FK to `users`)
- `githubUserId`: string
- `username`: string
- `encryptedAccessToken`: string (AES-256 encrypted)
- `scopes`: string (nullable)
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

### `githubRepositories`
- `id`: string (UUID, Document ID)
- `connectionId`: string (FK to `githubConnections`)
- `githubRepoId`: string
- `owner`: string
- `name`: string
- `fullName`: string
- `defaultBranch`: string
- `private`: boolean
- `htmlUrl`: string
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

### `pullRequests`
- `id`: string (UUID, Document ID)
- `repositoryId`: string (FK to `githubRepositories`)
- `githubPrId`: string
- `number`: number
- `title`: string
- `branchName`: string
- `baseBranch`: string
- `commitSha`: string
- `status`: string
- `reviewId`: string (FK to `reviews`, nullable)
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

### `usageRecords`
- `id`: string (UUID, Document ID)
- `userId`: string (FK to `users`)
- `action`: string
- `units`: number
- `metadata`: map (nullable)
- `createdAt`: Firestore Timestamp

### `auditLogs`
- `id`: string (UUID, Document ID)
- `userId`: string (FK to `users`, nullable)
- `action`: string
- `resourceType`: string
- `resourceId`: string (nullable)
- `ipHash`: string (nullable)
- `metadata`: map (nullable)
- `createdAt`: Firestore Timestamp

---

## 4. Firestore Composite Indexes (`firestore.indexes.json`)
- `reviews`: `userId` (ASC) + `createdAt` (DESC)
- `reviews`: `projectId` (ASC) + `createdAt` (DESC)
- `reviewIssues`: `reviewId` (ASC) + `severity` (ASC) + `lineStart` (ASC)
- `usageRecords`: `userId` (ASC) + `createdAt` (DESC)
- `auditLogs`: `userId` (ASC) + `createdAt` (DESC)
- `githubRepositories`: `connectionId` (ASC) + `fullName` (ASC)

---

## 5. Security & Privacy Model
- **Firebase Admin SDK Bypass**: All requests pass through Express authorization middleware. Direct client SDK connection to Firestore is disabled (`firestore.rules`).
- **Token Protection**: GitHub access tokens are encrypted using AES-256 before writing to Firestore and never returned in API responses.
- **Passwords**: Stored exclusively as bcrypt salted hashes.
