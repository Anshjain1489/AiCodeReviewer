const { prisma } = require('../config/database');

class GitHubRepositoryRepo {
  async findConnectionByUserId(userId) {
    return prisma.gitHubConnection.findFirst({
      where: { userId },
      include: { repositories: true },
    });
  }

  async upsertConnection({ userId, githubUserId, username, encryptedAccessToken, scopes }) {
    const existing = await prisma.gitHubConnection.findFirst({ where: { userId } });
    if (existing) {
      return prisma.gitHubConnection.update({
        where: { id: existing.id },
        data: { githubUserId, username, encryptedAccessToken, scopes },
      });
    }
    return prisma.gitHubConnection.create({
      data: { userId, githubUserId, username, encryptedAccessToken, scopes },
    });
  }

  async saveRepositories(connectionId, repos) {
    for (const r of repos) {
      const existing = await prisma.gitHubRepository.findFirst({
        where: { connectionId, githubRepoId: String(r.id) },
      });
      if (existing) {
        await prisma.gitHubRepository.update({
          where: { id: existing.id },
          data: {
            owner: r.owner.login,
            name: r.name,
            fullName: r.full_name,
            defaultBranch: r.default_branch,
            private: r.private,
            htmlUrl: r.html_url,
          },
        });
      } else {
        await prisma.gitHubRepository.create({
          data: {
            connectionId,
            githubRepoId: String(r.id),
            owner: r.owner.login,
            name: r.name,
            fullName: r.full_name,
            defaultBranch: r.default_branch,
            private: r.private,
            htmlUrl: r.html_url,
          },
        });
      }
    }
  }

  async findRepositoryById(id) {
    return prisma.gitHubRepository.findUnique({
      where: { id },
      include: { connection: true, pullRequests: true },
    });
  }
}

module.exports = new GitHubRepositoryRepo();
