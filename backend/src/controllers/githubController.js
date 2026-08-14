const githubService = require('../services/githubService');
const { successResponse } = require('../utils/responseFormatter');
const { logAuditAction } = require('../middleware/auditLogger');
const { env } = require('../config/env');

class GitHubController {
  async connect(req, res, next) {
    try {
      const url = await githubService.getConnectUrl();
      return successResponse(res, { url });
    } catch (error) {
      next(error);
    }
  }

  async callback(req, res, next) {
    try {
      const { code } = req.query;
      await githubService.handleOAuthCallback(req.user ? req.user.id : 'demo-user', code);
      return res.redirect(`${env.FRONTEND_URL}/github?connected=true`);
    } catch (error) {
      next(error);
    }
  }

  async listRepositories(req, res, next) {
    try {
      const repositories = await githubService.getUserRepositories(req.user.id);
      return successResponse(res, { repositories });
    } catch (error) {
      next(error);
    }
  }

  async listBranches(req, res, next) {
    try {
      const branches = await githubService.getRepositoryBranches(req.params.id, req.user.id);
      return successResponse(res, { branches });
    } catch (error) {
      next(error);
    }
  }

  async reviewRepository(req, res, next) {
    try {
      const { branch } = req.body;
      const review = await githubService.analyzeRepository(req.params.id, req.user.id, { branch });
      await logAuditAction({
        userId: req.user.id,
        action: 'GITHUB_REPO_REVIEW_CREATED',
        resourceType: 'GitHubRepository',
        resourceId: req.params.id,
      });
      return successResponse(res, { reviewId: review.id, status: review.status }, 201);
    } catch (error) {
      next(error);
    }
  }

  async listPullRequests(req, res, next) {
    try {
      const pulls = await githubService.listPullRequests(req.params.id, req.user.id);
      return successResponse(res, { pulls });
    } catch (error) {
      next(error);
    }
  }

  async reviewPullRequest(req, res, next) {
    try {
      const review = await githubService.analyzePullRequest(req.params.id, req.user.id);
      await logAuditAction({
        userId: req.user.id,
        action: 'GITHUB_PR_REVIEW_CREATED',
        resourceType: 'PullRequest',
        resourceId: req.params.id,
      });
      return successResponse(res, { reviewId: review.id, status: review.status }, 201);
    } catch (error) {
      next(error);
    }
  }

  async publishComment(req, res, next) {
    try {
      const { comment, issueId } = req.body;
      const result = await githubService.publishPRComment(req.params.id, req.user.id, { comment, issueId });
      await logAuditAction({
        userId: req.user.id,
        action: 'GITHUB_PR_COMMENT_PUBLISHED',
        resourceType: 'PullRequest',
        resourceId: req.params.id,
      });
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GitHubController();
