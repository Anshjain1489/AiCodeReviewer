const projectService = require('../services/projectService');
const { successResponse } = require('../utils/responseFormatter');
const { logAuditAction } = require('../middleware/auditLogger');

class ProjectController {
  async list(req, res, next) {
    try {
      const projects = await projectService.getUserProjects(req.user.id);
      return successResponse(res, { projects });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const project = await projectService.getProjectDetails(req.params.id, req.user.id);
      return successResponse(res, { project });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { name, description, language, repositoryUrl } = req.body;
      const project = await projectService.createProject(req.user.id, {
        name,
        description,
        language,
        repositoryUrl,
      });
      await logAuditAction({
        userId: req.user.id,
        action: 'PROJECT_CREATED',
        resourceType: 'Project',
        resourceId: project.id,
      });
      return successResponse(res, { project }, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const project = await projectService.updateProject(req.params.id, req.user.id, req.body);
      await logAuditAction({
        userId: req.user.id,
        action: 'PROJECT_UPDATED',
        resourceType: 'Project',
        resourceId: project.id,
      });
      return successResponse(res, { project });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await projectService.deleteProject(req.params.id, req.user.id);
      await logAuditAction({
        userId: req.user.id,
        action: 'PROJECT_DELETED',
        resourceType: 'Project',
        resourceId: req.params.id,
      });
      return successResponse(res, { message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();
