const { env } = require('../config/env');
const GeminiProvider = require('../integrations/ai/GeminiProvider');
const OpenAIProvider = require('../integrations/ai/OpenAIProvider');
const MockProvider = require('../integrations/ai/MockProvider');
const logger = require('../config/logger');

class AIService {
  constructor() {
    this.provider = this.initProvider();
  }

  initProvider() {
    const providerType = (env.AI_PROVIDER || 'mock').toLowerCase();
    logger.info(`Initializing AI Provider: [${providerType}]`);

    if (providerType === 'gemini') {
      if (!env.GEMINI_API_KEY) {
        logger.warn('AI_PROVIDER set to gemini but GEMINI_API_KEY missing. Falling back to MockProvider for safety.');
        return new MockProvider();
      }
      return new GeminiProvider(env.GEMINI_API_KEY);
    }

    if (providerType === 'openai') {
      if (!env.OPENAI_API_KEY) {
        logger.warn('AI_PROVIDER set to openai but OPENAI_API_KEY missing. Falling back to MockProvider for safety.');
        return new MockProvider();
      }
      return new OpenAIProvider(env.OPENAI_API_KEY);
    }

    return new MockProvider();
  }

  async analyzeCode(code, language, staticFindings = []) {
    try {
      return await this.provider.analyzeCode(code, language, staticFindings);
    } catch (err) {
      logger.error(`AI Analysis error with ${env.AI_PROVIDER}:`, err);
      // Controlled fallback to MockProvider so API never crashes
      const fallback = new MockProvider();
      return await fallback.analyzeCode(code, language, staticFindings);
    }
  }

  async explainIssue(issue, codeContext) {
    try {
      return await this.provider.explainIssue(issue, codeContext);
    } catch (err) {
      logger.error('AI Explain error:', err);
      const fallback = new MockProvider();
      return await fallback.explainIssue(issue, codeContext);
    }
  }

  async generateFix(issue, codeContext) {
    try {
      return await this.provider.generateFix(issue, codeContext);
    } catch (err) {
      logger.error('AI Fix Generation error:', err);
      const fallback = new MockProvider();
      return await fallback.generateFix(issue, codeContext);
    }
  }

  async chatAboutReview(message, history = [], reviewContext = {}) {
    try {
      return await this.provider.chatAboutReview(message, history, reviewContext);
    } catch (err) {
      logger.error('AI Chat error:', err);
      const fallback = new MockProvider();
      return await fallback.chatAboutReview(message, history, reviewContext);
    }
  }
}

module.exports = new AIService();
