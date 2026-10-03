const { db } = require('../config/database');

class DashboardService {
  async getSummary(userId) {
    const reviewsSnap = await db.collection('reviews').where('userId', '==', userId).get();
    const reviews = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const totalReviews = reviews.length;
    const completedReviews = reviews.filter((r) => r.status === 'COMPLETED' && r.overallScore !== null && r.overallScore !== undefined);

    const avgScore = completedReviews.length > 0
      ? Math.round(completedReviews.reduce((acc, r) => acc + (r.overallScore || 0), 0) / completedReviews.length)
      : 100;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        totalIssues: 0,
        criticalIssues: 0,
        averageScore: 100,
      };
    }

    const reviewIds = reviews.map((r) => r.id);

    // Fetch issues for user's reviews
    let totalIssues = 0;
    let criticalIssues = 0;

    // Process in batches of 30 if reviewIds list is large
    const chunkSize = 30;
    for (let i = 0; i < reviewIds.length; i += chunkSize) {
      const chunk = reviewIds.slice(i, i + chunkSize);
      const issuesSnap = await db.collection('reviewIssues').where('reviewId', 'in', chunk).get();

      totalIssues += issuesSnap.size;
      for (const doc of issuesSnap.docs) {
        if (doc.data().severity === 'CRITICAL') {
          criticalIssues++;
        }
      }
    }

    return {
      totalReviews,
      totalIssues,
      criticalIssues,
      averageScore: avgScore,
    };
  }

  async getTrends(userId) {
    const reviewsSnap = await db
      .collection('reviews')
      .where('userId', '==', userId)
      .where('status', '==', 'COMPLETED')
      .get();

    let reviews = reviewsSnap.docs.map((d) => {
      const data = d.data();
      return {
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
        overallScore: data.overallScore,
        securityScore: data.securityScore,
        bugScore: data.bugScore,
      };
    });

    reviews.sort((a, b) => a.createdAt - b.createdAt);
    reviews = reviews.slice(-30);

    return reviews.map((r) => ({
      date: r.createdAt.toISOString().split('T')[0],
      score: r.overallScore || 100,
      security: r.securityScore || 100,
      bugs: r.bugScore || 100,
    }));
  }

  async getIssueDistribution(userId) {
    const reviewsSnap = await db.collection('reviews').where('userId', '==', userId).get();
    const reviewIds = reviewsSnap.docs.map((d) => d.id);

    const severityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const categoryMap = { BUG: 0, SECURITY: 0, PERFORMANCE: 0, QUALITY: 0, MAINTAINABILITY: 0, COMPLEXITY: 0, BEST_PRACTICE: 0 };

    if (reviewIds.length === 0) {
      return {
        bySeverity: Object.entries(severityMap).map(([name, value]) => ({ name, value })),
        byCategory: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      };
    }

    const chunkSize = 30;
    for (let i = 0; i < reviewIds.length; i += chunkSize) {
      const chunk = reviewIds.slice(i, i + chunkSize);
      const issuesSnap = await db.collection('reviewIssues').where('reviewId', 'in', chunk).get();

      for (const doc of issuesSnap.docs) {
        const issue = doc.data();
        if (severityMap[issue.severity] !== undefined) severityMap[issue.severity]++;
        if (categoryMap[issue.category] !== undefined) categoryMap[issue.category]++;
      }
    }

    return {
      bySeverity: Object.entries(severityMap).map(([name, value]) => ({ name, value })),
      byCategory: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
    };
  }
}

module.exports = new DashboardService();
