const issueRepository = require('../repositories/issueRepository');
const reviewRepository = require('../repositories/reviewRepository');
const aiService = require('../services/aiService');
const reviewService = require('../services/reviewService');
const { successResponse, AppError } = require('../utils/responseFormatter');

class IssueController {
  async getById(req, res, next) {
    try {
      const issue = await issueRepository.findById(req.params.id);
      if (!issue) {
        throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
      }
      if (issue.review.userId !== req.user.id) {
        throw new AppError('Access denied', 403, 'FORBIDDEN');
      }
      return successResponse(res, { issue });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const validStatuses = ['OPEN', 'FIXED', 'IGNORED', 'ACCEPTED'];
      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid issue status', 400, 'INVALID_STATUS');
      }

      const issue = await issueRepository.findById(req.params.id);
      if (!issue || issue.review.userId !== req.user.id) {
        throw new AppError('Issue not found or unauthorized', 404, 'ISSUE_NOT_FOUND');
      }

      const updated = await issueRepository.updateStatus(req.params.id, status);
      return successResponse(res, { issue: updated });
    } catch (error) {
      next(error);
    }
  }

  async explain(req, res, next) {
    try {
      const issue = await issueRepository.findById(req.params.id);
      if (!issue || issue.review.userId !== req.user.id) {
        throw new AppError('Issue not found or unauthorized', 404, 'ISSUE_NOT_FOUND');
      }

      const codeContext = issue.review.code || '';
      const explanation = await aiService.explainIssue(issue, codeContext);
      return successResponse(res, { explanation: explanation.explanation, provider: explanation.provider });
    } catch (error) {
      next(error);
    }
  }

  async fix(req, res, next) {
    try {
      const issue = await issueRepository.findById(req.params.id);
      if (!issue || issue.review.userId !== req.user.id) {
        throw new AppError('Issue not found or unauthorized', 404, 'ISSUE_NOT_FOUND');
      }

      const codeContext = issue.review.code || '';
      const fixResult = await aiService.generateFix(issue, codeContext);

      const savedFix = await issueRepository.createFix({
        issueId: issue.id,
        originalCode: fixResult.originalCode || codeContext,
        suggestedCode: fixResult.suggestedCode || codeContext,
        explanation: fixResult.explanation || 'AI Fix generated',
      });

      return successResponse(res, { fix: savedFix });
    } catch (error) {
      next(error);
    }
  }

  async acceptFix(req, res, next) {
    try {
      const { fixId } = req.body;
      const issue = await issueRepository.findById(req.params.id);
      if (!issue || issue.review.userId !== req.user.id) {
        throw new AppError('Issue not found or unauthorized', 404, 'ISSUE_NOT_FOUND');
      }

      const fix = issue.fixes.find((f) => f.id === fixId) || issue.fixes[0];
      if (!fix) {
        throw new AppError('Fix record not found', 404, 'FIX_NOT_FOUND');
      }

      // Mark issue fixed & accept fix
      await issueRepository.updateStatus(issue.id, 'ACCEPTED');
      await issueRepository.updateFixStatus(fix.id, 'ACCEPTED');

      // Update review working code and trigger re-analysis
      await reviewRepository.updateStatus(issue.reviewId, 'QUEUED', { code: fix.suggestedCode });
      reviewService.executeReviewPipeline(issue.reviewId).catch(console.error);

      return successResponse(res, { message: 'Fix accepted, updated code and re-analyzing', issueId: issue.id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IssueController();
