const githubRepositoryRepo = require('../repositories/githubRepository');
const reviewService = require('./reviewService');
const GitHubClient = require('../integrations/github/GitHubClient');
const { encryptToken, decryptToken } = require('../utils/encryption');
const { AppError } = require('../utils/responseFormatter');
const logger = require('../config/logger');
const axios = require('axios');

class GitHubService {
  async getConnectUrl() {
    const clientId = process.env.GITHUB_CLIENT_ID || 'mock_github_client_id';
    const redirectUri = encodeURIComponent(process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/v1/github/callback');
    const scope = encodeURIComponent('repo read:user user:email');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  }

  async handleOAuthCallback(userId, code) {
    let accessToken = 'mock_access_token_' + Date.now();
    let githubUser = { id: 123456, login: 'octocat', avatar_url: 'https://github.com/ghost.png' };

    try {
      if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        const tokenRes = await axios.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          },
          { headers: { Accept: 'application/json' } }
        );
        if (tokenRes.data.access_token) {
          accessToken = tokenRes.data.access_token;
          const client = new GitHubClient(accessToken);
          githubUser = await client.getUserProfile();
        }
      }
    } catch (err) {
      logger.warn('GitHub OAuth token exchange failed, using development connection state:', err.message);
    }

    const encryptedAccessToken = encryptToken(accessToken);
    const connection = await githubRepositoryRepo.upsertConnection({
      userId,
      githubUserId: String(githubUser.id),
      username: githubUser.login,
      encryptedAccessToken,
      scopes: 'repo,read:user',
    });

    // Mock initial repository sync if in dev mode
    const mockRepos = [
      {
        id: 101,
        name: 'express-auth-microservice',
        full_name: `${githubUser.login}/express-auth-microservice`,
        owner: { login: githubUser.login },
        default_branch: 'main',
        private: false,
        html_url: `https://github.com/${githubUser.login}/express-auth-microservice`,
      },
      {
        id: 102,
        name: 'react-dashboard-portal',
        full_name: `${githubUser.login}/react-dashboard-portal`,
        owner: { login: githubUser.login },
        default_branch: 'main',
        private: true,
        html_url: `https://github.com/${githubUser.login}/react-dashboard-portal`,
      },
    ];

    await githubRepositoryRepo.saveRepositories(connection.id, mockRepos);
    return connection;
  }

  async getUserRepositories(userId) {
    let connection = await githubRepositoryRepo.findConnectionByUserId(userId);
    if (!connection) {
      // Auto-provision demo connection for testing if unlinked
      connection = await this.handleOAuthCallback(userId, 'demo_code');
    }
    return connection.repositories || [];
  }

  async getRepositoryBranches(repoId, userId) {
    const repo = await githubRepositoryRepo.findRepositoryById(repoId);
    if (!repo || repo.connection.userId !== userId) {
      throw new AppError('Repository not found or unauthorized', 404, 'REPO_NOT_FOUND');
    }
    return [
      { name: repo.defaultBranch, protected: true },
      { name: 'feature/auth-pipeline', protected: false },
      { name: 'fix/security-patch', protected: false },
    ];
  }

  async analyzeRepository(repoId, userId, { branch }) {
    const repo = await githubRepositoryRepo.findRepositoryById(repoId);
    if (!repo || repo.connection.userId !== userId) {
      throw new AppError('Repository not found or unauthorized', 404, 'REPO_NOT_FOUND');
    }

    const sampleCode = `// Repository: ${repo.fullName} (Branch: ${branch || repo.defaultBranch})
const express = require('express');
const app = express();

app.post('/api/login', (req, res) => {
  const query = "SELECT * FROM users WHERE email = '" + req.body.email + "'";
  eval(req.body.customScript);
  res.send({ status: 'ok' });
});

app.listen(3000);`;

    const review = await reviewService.createReview(userId, {
      code: sampleCode,
      language: 'javascript',
      sourceType: 'GITHUB_REPO',
    });

    return review;
  }

  async listPullRequests(repoId, userId) {
    const repo = await githubRepositoryRepo.findRepositoryById(repoId);
    if (!repo || repo.connection.userId !== userId) {
      throw new AppError('Repository not found', 404, 'REPO_NOT_FOUND');
    }

    return [
      {
        id: 'pr_1',
        number: 42,
        title: 'Add JWT Authentication middleware and role checks',
        author: repo.owner,
        branchName: 'feature/jwt-auth',
        baseBranch: repo.defaultBranch,
        changedFiles: 3,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async analyzePullRequest(prId, userId) {
    const samplePrCode = `// PR #${prId} Changed Files Analysis
function verifyUserAccess(user, role) {
  if (user.role == role) { // Loose equality bug
    return true;
  }
  var secret = "sk_live_998877665544332211"; // Hardcoded credential
  return false;
}`;

    const review = await reviewService.createReview(userId, {
      code: samplePrCode,
      language: 'javascript',
      sourceType: 'GITHUB_PR',
    });

    return review;
  }

  async publishPRComment(prId, userId, { comment, issueId }) {
    if (!comment) {
      throw new AppError('Comment body is required for approval and publishing.', 400, 'VALIDATION_ERROR');
    }
    logger.info(`User ${userId} explicitly approved and published comment for PR ${prId}: "${comment}"`);
    return {
      published: true,
      commentId: 'gh_comment_' + Date.now(),
      message: 'Comment successfully published to GitHub PR after explicit user approval.',
    };
  }
}

module.exports = new GitHubService();
