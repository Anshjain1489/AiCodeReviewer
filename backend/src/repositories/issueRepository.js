const { db, admin } = require('../config/database');
const crypto = require('crypto');

function formatIssue(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
  };
}

const severityRank = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  INFO: 5,
};

class IssueRepository {
  async createMany(issuesData) {
    if (!issuesData || issuesData.length === 0) return { count: 0 };

    const chunkSize = 450; // Firestore 500 write limit per batch
    let createdCount = 0;

    for (let i = 0; i < issuesData.length; i += chunkSize) {
      const chunk = issuesData.slice(i, i + chunkSize);
      const batch = db.batch();

      for (const item of chunk) {
        const issueId = item.id || crypto.randomUUID();
        const ref = db.collection('reviewIssues').doc(issueId);
        const now = admin.firestore.Timestamp.now();

        batch.set(ref, {
          ...item,
          id: issueId,
          status: item.status || 'OPEN',
          createdAt: now,
        });
        createdCount++;
      }

      await batch.commit();
    }

    return { count: createdCount };
  }

  async findById(id) {
    const doc = await db.collection('reviewIssues').doc(id).get();
    if (!doc.exists) return null;

    const issue = formatIssue(doc);

    // Fetch parent review summary & fixes
    const [reviewDoc, fixesSnap] = await Promise.all([
      db.collection('reviews').doc(issue.reviewId).get(),
      db.collection('issueFixes').where('issueId', '==', id).get(),
    ]);

    const reviewData = reviewDoc.exists ? reviewDoc.data() : {};
    const review = reviewDoc.exists
      ? {
          id: reviewDoc.id,
          userId: reviewData.userId,
          code: reviewData.code,
          language: reviewData.language,
        }
      : null;

    const fixes = fixesSnap.docs.map((f) => ({
      id: f.id,
      ...f.data(),
      createdAt: f.data().createdAt?.toDate ? f.data().createdAt.toDate() : f.data().createdAt,
    }));

    return {
      ...issue,
      review,
      fixes,
    };
  }

  async findByReviewId(reviewId, { severity, category, status, filePath } = {}) {
    let snapshot = await db.collection('reviewIssues').where('reviewId', '==', reviewId).get();

    let issues = snapshot.docs.map(formatIssue);

    if (severity) issues = issues.filter((i) => i.severity === severity);
    if (category) issues = issues.filter((i) => i.category === category);
    if (status) issues = issues.filter((i) => i.status === status);
    if (filePath) issues = issues.filter((i) => i.filePath === filePath);

    // Sort by severity asc, lineStart asc
    issues.sort((a, b) => {
      const rankA = severityRank[a.severity] || 99;
      const rankB = severityRank[b.severity] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return (a.lineStart || 0) - (b.lineStart || 0);
    });

    // Populate fixes for each issue
    const issuesWithFixes = await Promise.all(
      issues.map(async (iss) => {
        const fixesSnap = await db.collection('issueFixes').where('issueId', '==', iss.id).get();
        const fixes = fixesSnap.docs.map((f) => ({
          id: f.id,
          ...f.data(),
          createdAt: f.data().createdAt?.toDate ? f.data().createdAt.toDate() : f.data().createdAt,
        }));
        return {
          ...iss,
          fixes,
        };
      })
    );

    return issuesWithFixes;
  }

  async updateStatus(id, status) {
    const issueRef = db.collection('reviewIssues').doc(id);
    await issueRef.update({ status });
    const doc = await issueRef.get();
    return formatIssue(doc);
  }

  async createFix({ issueId, originalCode, suggestedCode, explanation }) {
    const fixId = crypto.randomUUID();
    const now = admin.firestore.Timestamp.now();

    const fixData = {
      issueId,
      originalCode,
      suggestedCode,
      explanation,
      status: 'OPEN',
      createdAt: now,
    };

    await db.collection('issueFixes').doc(fixId).set(fixData);

    return {
      id: fixId,
      ...fixData,
      createdAt: now.toDate(),
    };
  }

  async updateFixStatus(fixId, status) {
    const fixRef = db.collection('issueFixes').doc(fixId);
    await fixRef.update({ status });
    const doc = await fixRef.get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
    };
  }
}

module.exports = new IssueRepository();
