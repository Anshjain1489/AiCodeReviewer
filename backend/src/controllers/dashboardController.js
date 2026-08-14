const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/responseFormatter');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary(req.user.id);
      return successResponse(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req, res, next) {
    try {
      const trends = await dashboardService.getTrends(req.user.id);
      return successResponse(res, { trends });
    } catch (error) {
      next(error);
    }
  }

  async getIssues(req, res, next) {
    try {
      const distribution = await dashboardService.getIssueDistribution(req.user.id);
      return successResponse(res, distribution);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
