const { prisma } = require('../config/database');

class IssueRepository {
  async createMany(issuesData) {
    return prisma.reviewIssue.createMany({
      data: issuesData,
    });
  }

  async findById(id) {
    return prisma.reviewIssue.findUnique({
      where: { id },
      include: {
        review: { select: { id: true, userId: true, code: true, language: true } },
        fixes: true,
      },
    });
  }

  async findByReviewId(reviewId, { severity, category, status, filePath } = {}) {
    const where = { reviewId };
    if (severity) where.severity = severity;
    if (category) where.category = category;
    if (status) where.status = status;
    if (filePath) where.filePath = filePath;

    return prisma.reviewIssue.findMany({
      where,
      include: { fixes: true },
      orderBy: [{ severity: 'asc' }, { lineStart: 'asc' }],
    });
  }

  async updateStatus(id, status) {
    return prisma.reviewIssue.update({
      where: { id },
      data: { status },
    });
  }

  async createFix({ issueId, originalCode, suggestedCode, explanation }) {
    return prisma.issueFix.create({
      data: {
        issueId,
        originalCode,
        suggestedCode,
        explanation,
        status: 'OPEN',
      },
    });
  }

  async updateFixStatus(fixId, status) {
    return prisma.issueFix.update({
      where: { id: fixId },
      data: { status },
    });
  }
}

module.exports = new IssueRepository();
