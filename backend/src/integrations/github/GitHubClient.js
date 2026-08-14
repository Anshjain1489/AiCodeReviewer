const axios = require('axios');
const logger = require('../../config/logger');

class GitHubClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(accessToken ? { Authorization: `token ${accessToken}` } : {}),
      },
    });
  }

  async getUserProfile() {
    const res = await this.client.get('/user');
    return res.data;
  }

  async listRepositories() {
    const res = await this.client.get('/user/repos?sort=updated&per_page=100');
    return res.data;
  }

  async listBranches(owner, repo) {
    const res = await this.client.get(`/repos/${owner}/${repo}/branches`);
    return res.data;
  }

  async listPullRequests(owner, repo) {
    const res = await this.client.get(`/repos/${owner}/${repo}/pulls?state=open`);
    return res.data;
  }

  async getPullRequestFiles(owner, repo, prNumber) {
    const res = await this.client.get(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);
    return res.data;
  }

  async createPRComment(owner, repo, prNumber, body) {
    const res = await this.client.post(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, { body });
    return res.data;
  }
}

module.exports = GitHubClient;
