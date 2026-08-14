const reviewRepository = require('../repositories/reviewRepository');
const issueRepository = require('../repositories/issueRepository');
const analyzerRegistry = require('../analyzers/AnalyzerRegistry');
const aiService = require('./aiService');
const scoringService = require('./scoringService');
const { AppError } = require('../utils/responseFormatter');
const logger = require('../config/logger');

class ReviewService {
  async createReview(userId, { projectId, code, language = 'javascript', sourceType = 'MANUAL' }) {
    if (!code || code.trim().length === 0) {
      throw new AppError('Code content cannot be empty', 400, 'EMPTY_CODE');
    }

    const review = await reviewRepository.create({
      userId,
      projectId,
      sourceType,
      code,
      language,
    });

    // Run analysis asynchronously/immediately
    this.executeReviewPipeline(review.id).catch((err) => {
      logger.error(`Review pipeline background failure for ID ${review.id}:`, err);
    });

    return review;
  }

  async executeReviewPipeline(reviewId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) return;

    try {
      await reviewRepository.updateStatus(reviewId, 'RUNNING', { startedAt: new Date() });

      const code = review.code || '';
      const language = review.language || 'javascript';

      // Step 1: Static Analysis
      const staticFindings = await analyzerRegistry.runAll(code, { filename: `source.${language}` });

      // Step 2: AI Analysis
      const aiResults = await aiService.analyzeCode(code, language, staticFindings);

      // Step 3: Combine & Deduplicate findings
      const combinedIssues = [...staticFindings];

      if (aiResults && Array.isArray(aiResults.issues)) {
        for (const aiIssue of aiResults.issues) {
          combinedIssues.push({
            severity: aiIssue.severity || 'MEDIUM',
            category: aiIssue.category || 'QUALITY',
            title: aiIssue.title || 'AI Code Insight',
            description: aiIssue.description || '',
            file: aiIssue.file || `source.${language}`,
            line: aiIssue.line || 1,
            column: aiIssue.column || 1,
            ruleId: 'ai-reasoning',
            source: aiResults.provider || 'ai-engine',
            fingerprint: `ai-${aiIssue.line || 1}-${aiIssue.title}`,
            recommendation: aiIssue.recommendation || '',
            impact: aiIssue.impact || '',
          });
        }
      }

      const deduplicated = analyzerRegistry.deduplicateFindings(combinedIssues);

      // Step 4: Save issues to database
      if (deduplicated.length > 0) {
        const issuesData = deduplicated.map((i) => ({
          reviewId,
          filePath: i.file,
          lineStart: i.line,
          lineEnd: i.line,
          columnStart: i.column,
          columnEnd: i.column,
          category: i.category,
          severity: i.severity,
          title: i.title,
          description: i.description,
          impact: i.impact,
          recommendation: i.recommendation,
          ruleId: i.ruleId,
          source: i.source,
          fingerprint: i.fingerprint,
          status: 'OPEN',
        }));
        await issueRepository.createMany(issuesData);
      }

      // Step 5: Calculate score
      const lineCount = code.split('\n').length;
      const scores = scoringService.calculateScores(deduplicated, lineCount);

      // Step 6: Mark review completed
      await reviewRepository.updateScores(reviewId, scores, deduplicated.length);
      logger.info(`Review pipeline completed successfully for ID ${reviewId}. Overall Score: ${scores.overallScore}`);
    } catch (err) {
      logger.error(`Review pipeline execution failed for ID ${reviewId}:`, err);
      await reviewRepository.updateStatus(reviewId, 'FAILED');
    }
  }

  async getReviewDetails(reviewId, userId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }
    if (review.userId !== userId) {
      throw new AppError('Access denied. You do not own this review.', 403, 'FORBIDDEN');
    }
    return review;
  }

  async getUserReviews(userId, query) {
    return reviewRepository.findByUserId(userId, query);
  }

  async reanalyzeReview(reviewId, userId) {
    const review = await this.getReviewDetails(reviewId, userId);
    await reviewRepository.updateStatus(reviewId, 'QUEUED');
    this.executeReviewPipeline(reviewId).catch((err) => {
      logger.error(`Re-analysis background failure for ID ${reviewId}:`, err);
    });
    return { reviewId, status: 'QUEUED' };
  }

  async deleteReview(reviewId, userId) {
    await this.getReviewDetails(reviewId, userId);
    return reviewRepository.delete(reviewId);
  }
}

module.exports = new ReviewService();
