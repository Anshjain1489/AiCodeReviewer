const { prisma } = require('../config/database');

class ProjectRepository {
  async findByUserId(userId) {
    return prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { files: true, reviews: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        files: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async create({ userId, name, description, language, repositoryUrl }) {
    return prisma.project.create({
      data: {
        userId,
        name,
        description,
        language: language || 'javascript',
        repositoryUrl,
      },
    });
  }

  async update(id, userId, data) {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.project.delete({
      where: { id },
    });
  }
}

module.exports = new ProjectRepository();
