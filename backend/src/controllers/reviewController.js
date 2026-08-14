const reviewService = require('../services/reviewService');
const issueRepository = require('../repositories/issueRepository');
const aiService = require('../services/aiService');
const { successResponse } = require('../utils/responseFormatter');
const { logAuditAction } = require('../middleware/auditLogger');

class ReviewController {
  async create(req, res, next) {
    try {
      const { projectId, code, language, sourceType } = req.body;
      const review = await reviewService.createReview(req.user.id, {
        projectId,
        code,
        language,
        sourceType,
      });

      await logAuditAction({
        userId: req.user.id,
        action: 'REVIEW_CREATED',
        resourceType: 'Review',
        resourceId: review.id,
      });

      return successResponse(res, { reviewId: review.id, status: review.status }, 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { page, limit, status, projectId } = req.query;
      const result = await reviewService.getUserReviews(req.user.id, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        status,
        projectId,
      });
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const review = await reviewService.getReviewDetails(req.params.id, req.user.id);
      return successResponse(res, { review });
    } catch (error) {
      next(error);
    }
  }

  async getIssues(req, res, next) {
    try {
      await reviewService.getReviewDetails(req.params.id, req.user.id);
      const { severity, category, status, filePath } = req.query;
      const issues = await issueRepository.findByReviewId(req.params.id, {
        severity,
        category,
        status,
        filePath,
      });
      return successResponse(res, { issues });
    } catch (error) {
      next(error);
    }
  }

  async reanalyze(req, res, next) {
    try {
      const result = await reviewService.reanalyzeReview(req.params.id, req.user.id);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await reviewService.deleteReview(req.params.id, req.user.id);
      return successResponse(res, { message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async chat(req, res, next) {
    try {
      const { message } = req.body;
      const review = await reviewService.getReviewDetails(req.params.id, req.user.id);
      const chatResult = await aiService.chatAboutReview(message, [], {
        overallScore: review.overallScore,
        totalIssues: review.totalIssues,
        code: review.code,
        language: review.language,
      });

      return successResponse(res, { message: chatResult.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
