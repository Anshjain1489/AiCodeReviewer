/**
 * ONE-TIME DATA MIGRATION TOOL: PostgreSQL -> Firebase Firestore
 * Usage:
 *   Dry-run mode (does not write to Firestore):
 *     node scripts/migratePostgresToFirestore.js --dry-run
 *
 *   Live migration mode:
 *     node scripts/migratePostgresToFirestore.js
 */

const { db } = require('../src/config/database');
const logger = require('../src/config/logger');

async function runMigration() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('=====================================================');
  console.log(`Starting PostgreSQL -> Firestore Data Migration ${isDryRun ? '[DRY RUN MODE]' : '[LIVE MODE]'}`);
  console.log('=====================================================');

  let prisma;
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Successfully connected to source PostgreSQL database.');
  } catch (err) {
    console.warn('PostgreSQL / Prisma client unavailable or DATABASE_URL missing. Migration cannot read existing SQL data.');
    console.warn('Reason:', err.message);
    process.exit(0);
  }

  const stats = {
    users: 0,
    projects: 0,
    projectFiles: 0,
    reviews: 0,
    reviewIssues: 0,
    issueFixes: 0,
    aiConversations: 0,
    aiMessages: 0,
    githubConnections: 0,
    githubRepositories: 0,
    pullRequests: 0,
    usageRecords: 0,
    auditLogs: 0,
  };

  try {
    // 1. Migrate Users
    const users = await prisma.user.findMany();
    for (const u of users) {
      if (!isDryRun) {
        await db.collection('users').doc(u.id).set(
          {
            name: u.name,
            email: u.email.toLowerCase(),
            passwordHash: u.passwordHash,
            avatarUrl: u.avatarUrl,
            provider: u.provider,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          },
          { merge: true }
        );
      }
      stats.users++;
    }

    // 2. Migrate Projects
    const projects = await prisma.project.findMany();
    for (const p of projects) {
      if (!isDryRun) {
        await db.collection('projects').doc(p.id).set(
          {
            userId: p.userId,
            name: p.name,
            description: p.description,
            language: p.language,
            repositoryUrl: p.repositoryUrl,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          },
          { merge: true }
        );
      }
      stats.projects++;
    }

    // 3. Migrate ProjectFiles
    const files = await prisma.projectFile.findMany();
    for (const f of files) {
      if (!isDryRun) {
        await db.collection('projectFiles').doc(f.id).set(
          {
            projectId: f.projectId,
            path: f.path,
            language: f.language,
            sizeBytes: f.sizeBytes,
            contentHash: f.contentHash,
            createdAt: f.createdAt,
          },
          { merge: true }
        );
      }
      stats.projectFiles++;
    }

    // 4. Migrate Reviews
    const reviews = await prisma.review.findMany();
    for (const r of reviews) {
      if (!isDryRun) {
        await db.collection('reviews').doc(r.id).set(
          {
            projectId: r.projectId,
            userId: r.userId,
            sourceType: r.sourceType,
            commitSha: r.commitSha,
            branchName: r.branchName,
            status: r.status,
            overallScore: r.overallScore,
            securityScore: r.securityScore,
            bugScore: r.bugScore,
            performanceScore: r.performanceScore,
            maintainabilityScore: r.maintainabilityScore,
            qualityScore: r.qualityScore,
            totalIssues: r.totalIssues,
            code: r.code,
            language: r.language,
            startedAt: r.startedAt,
            completedAt: r.completedAt,
            createdAt: r.createdAt,
          },
          { merge: true }
        );
      }
      stats.reviews++;
    }

    // 5. Migrate ReviewIssues
    const issues = await prisma.reviewIssue.findMany();
    for (const i of issues) {
      if (!isDryRun) {
        await db.collection('reviewIssues').doc(i.id).set(
          {
            reviewId: i.reviewId,
            filePath: i.filePath,
            lineStart: i.lineStart,
            lineEnd: i.lineEnd,
            columnStart: i.columnStart,
            columnEnd: i.columnEnd,
            category: i.category,
            severity: i.severity,
            title: i.title,
            description: i.description,
            impact: i.impact,
            recommendation: i.recommendation,
            ruleId: i.ruleId,
            source: i.source,
            fingerprint: i.fingerprint,
            status: i.status,
            createdAt: i.createdAt,
          },
          { merge: true }
        );
      }
      stats.reviewIssues++;
    }

    // 6. Migrate IssueFixes
    const fixes = await prisma.issueFix.findMany();
    for (const f of fixes) {
      if (!isDryRun) {
        await db.collection('issueFixes').doc(f.id).set(
          {
            issueId: f.issueId,
            originalCode: f.originalCode,
            suggestedCode: f.suggestedCode,
            explanation: f.explanation,
            status: f.status,
            createdAt: f.createdAt,
          },
          { merge: true }
        );
      }
      stats.issueFixes++;
    }

    // 7. Migrate AI Conversations
    const convs = await prisma.aIConversation.findMany();
    for (const c of convs) {
      if (!isDryRun) {
        await db.collection('aiConversations').doc(c.id).set(
          {
            userId: c.userId,
            reviewId: c.reviewId,
            title: c.title,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          },
          { merge: true }
        );
      }
      stats.aiConversations++;
    }

    // 8. Migrate AI Messages
    const msgs = await prisma.aIMessage.findMany();
    for (const m of msgs) {
      if (!isDryRun) {
        await db.collection('aiMessages').doc(m.id).set(
          {
            conversationId: m.conversationId,
            role: m.role,
            content: m.content,
            tokenUsage: m.tokenUsage,
            createdAt: m.createdAt,
          },
          { merge: true }
        );
      }
      stats.aiMessages++;
    }

    // 9. Migrate GitHub Connections
    const ghConns = await prisma.gitHubConnection.findMany();
    for (const g of ghConns) {
      if (!isDryRun) {
        await db.collection('githubConnections').doc(g.id).set(
          {
            userId: g.userId,
            githubUserId: g.githubUserId,
            username: g.username,
            encryptedAccessToken: g.encryptedAccessToken,
            scopes: g.scopes,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
          },
          { merge: true }
        );
      }
      stats.githubConnections++;
    }

    // 10. Migrate GitHub Repositories
    const ghRepos = await prisma.gitHubRepository.findMany();
    for (const r of ghRepos) {
      if (!isDryRun) {
        await db.collection('githubRepositories').doc(r.id).set(
          {
            connectionId: r.connectionId,
            githubRepoId: r.githubRepoId,
            owner: r.owner,
            name: r.name,
            fullName: r.fullName,
            defaultBranch: r.defaultBranch,
            private: r.private,
            htmlUrl: r.htmlUrl,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          },
          { merge: true }
        );
      }
      stats.githubRepositories++;
    }

    // 11. Migrate Pull Requests
    const prs = await prisma.pullRequest.findMany();
    for (const pr of prs) {
      if (!isDryRun) {
        await db.collection('pullRequests').doc(pr.id).set(
          {
            repositoryId: pr.repositoryId,
            githubPrId: pr.githubPrId,
            number: pr.number,
            title: pr.title,
            branchName: pr.branchName,
            baseBranch: pr.baseBranch,
            commitSha: pr.commitSha,
            status: pr.status,
            reviewId: pr.reviewId,
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
          },
          { merge: true }
        );
      }
      stats.pullRequests++;
    }

    // 12. Migrate Usage Records
    const usage = await prisma.usageRecord.findMany();
    for (const u of usage) {
      if (!isDryRun) {
        await db.collection('usageRecords').doc(u.id).set(
          {
            userId: u.userId,
            action: u.action,
            units: u.units,
            metadata: u.metadata,
            createdAt: u.createdAt,
          },
          { merge: true }
        );
      }
      stats.usageRecords++;
    }

    // 13. Migrate Audit Logs
    const audit = await prisma.auditLog.findMany();
    for (const a of audit) {
      if (!isDryRun) {
        await db.collection('auditLogs').doc(a.id).set(
          {
            userId: a.userId,
            action: a.action,
            resourceType: a.resourceType,
            resourceId: a.resourceId,
            ipHash: a.ipHash,
            metadata: a.metadata,
            createdAt: a.createdAt,
          },
          { merge: true }
        );
      }
      stats.auditLogs++;
    }

    console.log('\n=====================================================');
    console.log(`MIGRATION SUMMARY ${isDryRun ? '[DRY RUN]' : '[COMPLETED]'}`);
    console.log('=====================================================');
    console.table(stats);
  } catch (err) {
    console.error('Migration failed with error:', err);
  } finally {
    if (prisma) await prisma.$disconnect();
    process.exit(0);
  }
}

runMigration();
