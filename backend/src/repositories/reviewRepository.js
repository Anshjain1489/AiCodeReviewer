const { db, admin } = require('../config/database');
const crypto = require('crypto');

function formatReview(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    startedAt: data.startedAt?.toDate ? data.startedAt.toDate() : (data.startedAt ? new Date(data.startedAt) : null),
    completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : (data.completedAt ? new Date(data.completedAt) : null),
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

class ReviewRepository {
  async create({ userId, projectId, sourceType, code, language }) {
    const reviewId = crypto.randomUUID();
    const now = admin.firestore.Timestamp.now();

    const reviewData = {
      userId,
      projectId: projectId || null,
      sourceType: sourceType || 'MANUAL',
      code: code || '',
      language: language || 'javascript',
      status: 'QUEUED',
      overallScore: null,
      securityScore: null,
      bugScore: null,
      performanceScore: null,
      maintainabilityScore: null,
      qualityScore: null,
      totalIssues: 0,
      createdAt: now,
    };

    await db.collection('reviews').doc(reviewId).set(reviewData);

    return {
      id: reviewId,
      ...reviewData,
      createdAt: now.toDate(),
    };
  }

  async findById(id) {
    const doc = await db.collection('reviews').doc(id).get();
    if (!doc.exists) return null;

    const review = formatReview(doc);

    // Fetch associated project, user, issues with fixes, and aiConversations with messages
    const [projectDoc, userDoc, issuesSnap, conversationsSnap] = await Promise.all([
      review.projectId ? db.collection('projects').doc(review.projectId).get() : Promise.resolve(null),
      db.collection('users').doc(review.userId).get(),
      db.collection('reviewIssues').where('reviewId', '==', id).get(),
      db.collection('aiConversations').where('reviewId', '==', id).get(),
    ]);

    const project = projectDoc && projectDoc.exists ? { id: projectDoc.id, ...projectDoc.data() } : null;
    const user = userDoc && userDoc.exists ? { id: userDoc.id, name: userDoc.data().name, email: userDoc.data().email } : null;

    // Fetch fixes for issues
    const issues = await Promise.all(
      issuesSnap.docs.map(async (issueDoc) => {
        const issueData = issueDoc.data();
        const fixesSnap = await db.collection('issueFixes').where('issueId', '==', issueDoc.id).get();
        const fixes = fixesSnap.docs.map((f) => ({
          id: f.id,
          ...f.data(),
          createdAt: f.data().createdAt?.toDate ? f.data().createdAt.toDate() : f.data().createdAt,
        }));

        return {
          id: issueDoc.id,
          ...issueData,
          createdAt: issueData.createdAt?.toDate ? issueData.createdAt.toDate() : issueData.createdAt,
          fixes,
        };
      })
    );

    // Sort issues by severity asc, lineStart asc
    issues.sort((a, b) => {
      const rankA = severityRank[a.severity] || 99;
      const rankB = severityRank[b.severity] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return (a.lineStart || 0) - (b.lineStart || 0);
    });

    // Fetch messages for AI conversations
    const aiConversations = await Promise.all(
      conversationsSnap.docs.map(async (convDoc) => {
        const convData = convDoc.data();
        const msgsSnap = await db.collection('aiMessages').where('conversationId', '==', convDoc.id).get();
        const messages = msgsSnap.docs.map((m) => ({
          id: m.id,
          ...m.data(),
          createdAt: m.data().createdAt?.toDate ? m.data().createdAt.toDate() : m.data().createdAt,
        }));
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        return {
          id: convDoc.id,
          ...convData,
          createdAt: convData.createdAt?.toDate ? convData.createdAt.toDate() : convData.createdAt,
          updatedAt: convData.updatedAt?.toDate ? convData.updatedAt.toDate() : convData.updatedAt,
          messages,
        };
      })
    );

    return {
      ...review,
      project,
      user,
      issues,
      aiConversations,
    };
  }

  async findByUserId(userId, { page = 1, limit = 20, status, projectId } = {}) {
    let query = db.collection('reviews').where('userId', '==', userId);

    if (status) query = query.where('status', '==', status);
    if (projectId) query = query.where('projectId', '==', projectId);

    const snapshot = await query.get();
    let allReviews = snapshot.docs.map(formatReview);

    // Sort descending by createdAt
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = allReviews.length;
    const skip = (page - 1) * limit;
    const paginatedReviews = allReviews.slice(skip, skip + limit);

    // Populate project name and issue counts
    const reviewsWithDetails = await Promise.all(
      paginatedReviews.map(async (r) => {
        let projectName = null;
        if (r.projectId) {
          const pDoc = await db.collection('projects').doc(r.projectId).get();
          if (pDoc.exists) projectName = pDoc.data().name;
        }

        const issuesCountSnap = await db.collection('reviewIssues').where('reviewId', '==', r.id).count().get();

        return {
          ...r,
          project: projectName ? { name: projectName } : null,
          _count: { issues: issuesCountSnap.data().count },
        };
      })
    );

    return { total, page, limit, reviews: reviewsWithDetails };
  }

  async updateStatus(id, status, extraData = {}) {
    const reviewRef = db.collection('reviews').doc(id);
    const updatePayload = {
      status,
      ...extraData,
    };
    if (extraData.startedAt && extraData.startedAt instanceof Date) {
      updatePayload.startedAt = admin.firestore.Timestamp.fromDate(extraData.startedAt);
    }
    if (extraData.completedAt && extraData.completedAt instanceof Date) {
      updatePayload.completedAt = admin.firestore.Timestamp.fromDate(extraData.completedAt);
    }

    await reviewRef.update(updatePayload);
    const doc = await reviewRef.get();
    return formatReview(doc);
  }

  async updateScores(id, scores, totalIssues) {
    const reviewRef = db.collection('reviews').doc(id);
    const now = admin.firestore.Timestamp.now();

    const updatePayload = {
      status: 'COMPLETED',
      overallScore: scores.overallScore,
      securityScore: scores.securityScore,
      bugScore: scores.bugScore,
      performanceScore: scores.performanceScore,
      maintainabilityScore: scores.maintainabilityScore,
      qualityScore: scores.qualityScore,
      totalIssues,
      completedAt: now,
    };

    await reviewRef.update(updatePayload);
    const doc = await reviewRef.get();
    return formatReview(doc);
  }

  async delete(id) {
    const reviewRef = db.collection('reviews').doc(id);
    const doc = await reviewRef.get();
    if (!doc.exists) return null;
    const review = formatReview(doc);

    await reviewRef.delete();
    return review;
  }
}

module.exports = new ReviewRepository();
