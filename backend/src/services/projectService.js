const projectRepository = require('../repositories/projectRepository');
const { AppError } = require('../utils/responseFormatter');

class ProjectService {
  async getUserProjects(userId) {
    return projectRepository.findByUserId(userId);
  }

  async getProjectDetails(id, userId) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }
    if (project.userId !== userId) {
      throw new AppError('Access denied. You do not own this project.', 403, 'FORBIDDEN');
    }
    return project;
  }

  async createProject(userId, { name, description, language, repositoryUrl }) {
    if (!name) {
      throw new AppError('Project name is required', 400, 'VALIDATION_ERROR');
    }
    return projectRepository.create({
      userId,
      name,
      description,
      language,
      repositoryUrl,
    });
  }

  async updateProject(id, userId, updateData) {
    await this.getProjectDetails(id, userId);
    return projectRepository.update(id, userId, updateData);
  }

  async deleteProject(id, userId) {
    await this.getProjectDetails(id, userId);
    return projectRepository.delete(id);
  }
}

module.exports = new ProjectService();
