const { prisma } = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        provider: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create({ name, email, passwordHash, avatarUrl, provider = 'email', role = 'USER' }) {
    return prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        avatarUrl,
        provider,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        provider: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        updatedAt: true,
      },
    });
  }
}

module.exports = new UserRepository();
