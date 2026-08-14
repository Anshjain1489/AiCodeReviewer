const { prisma } = require('../config/database');

class DashboardService {
  async getSummary(userId) {
    const [totalReviews, totalIssues, criticalIssues, completedReviews] = await Promise.all([
      prisma.review.count({ where: { userId } }),
      prisma.reviewIssue.count({ where: { review: { userId } } }),
      prisma.reviewIssue.count({ where: { review: { userId }, severity: 'CRITICAL' } }),
      prisma.review.findMany({
        where: { userId, status: 'COMPLETED', overallScore: { not: null } },
        select: { overallScore: true },
      }),
    ]);

    const avgScore = completedReviews.length > 0
      ? Math.round(completedReviews.reduce((acc, r) => acc + (r.overallScore || 0), 0) / completedReviews.length)
      : 100;

    return {
      totalReviews,
      totalIssues,
      criticalIssues,
      averageScore: avgScore,
    };
  }

  async getTrends(userId) {
    const reviews = await prisma.review.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { createdAt: true, overallScore: true, securityScore: true, bugScore: true },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });

    return reviews.map((r) => ({
      date: r.createdAt.toISOString().split('T')[0],
      score: r.overallScore || 100,
      security: r.securityScore || 100,
      bugs: r.bugScore || 100,
    }));
  }

  async getIssueDistribution(userId) {
    const issues = await prisma.reviewIssue.findMany({
      where: { review: { userId } },
      select: { severity: true, category: true },
    });

    const severityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const categoryMap = { BUG: 0, SECURITY: 0, PERFORMANCE: 0, QUALITY: 0, MAINTAINABILITY: 0, COMPLEXITY: 0, BEST_PRACTICE: 0 };

    for (const issue of issues) {
      if (severityMap[issue.severity] !== undefined) severityMap[issue.severity]++;
      if (categoryMap[issue.category] !== undefined) categoryMap[issue.category]++;
    }

    return {
      bySeverity: Object.entries(severityMap).map(([name, value]) => ({ name, value })),
      byCategory: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
    };
  }
}

module.exports = new DashboardService();
