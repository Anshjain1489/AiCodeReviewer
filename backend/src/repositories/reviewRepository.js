const { prisma } = require('../config/database');

class ReviewRepository {
  async create({ userId, projectId, sourceType, code, language }) {
    return prisma.review.create({
      data: {
        userId,
        projectId,
        sourceType: sourceType || 'MANUAL',
        code,
        language: language || 'javascript',
        status: 'QUEUED',
      },
    });
  }

  async findById(id) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        project: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        issues: {
          include: { fixes: true },
          orderBy: [{ severity: 'asc' }, { lineStart: 'asc' }],
        },
        aiConversations: {
          include: { messages: true },
        },
      },
    });
  }

  async findByUserId(userId, { page = 1, limit = 20, status, projectId } = {}) {
    const where = { userId };
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const skip = (page - 1) * limit;
    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { name: true } },
          _count: { select: { issues: true } },
        },
      }),
    ]);

    return { total, page, limit, reviews };
  }

  async updateStatus(id, status, extraData = {}) {
    return prisma.review.update({
      where: { id },
      data: {
        status,
        ...extraData,
      },
    });
  }

  async updateScores(id, scores, totalIssues) {
    return prisma.review.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        overallScore: scores.overallScore,
        securityScore: scores.securityScore,
        bugScore: scores.bugScore,
        performanceScore: scores.performanceScore,
        maintainabilityScore: scores.maintainabilityScore,
        qualityScore: scores.qualityScore,
        totalIssues,
        completedAt: new Date(),
      },
    });
  }

  async delete(id) {
    return prisma.review.delete({
      where: { id },
    });
  }
}

module.exports = new ReviewRepository();
