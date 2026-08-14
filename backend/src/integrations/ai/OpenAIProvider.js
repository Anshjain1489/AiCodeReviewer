const OpenAI = require('openai');
const AIProvider = require('./AIProvider');
const logger = require('../../config/logger');

class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async analyzeCode(code, language, staticFindings = []) {
    if (!this.openai) throw new Error('OpenAI API key is not configured.');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert security and performance auditor. Output valid JSON strictly matching {"summary": "...", "issues": [...]}',
        },
        {
          role: 'user',
          content: `Analyze language ${language}:\n${code}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return {
      provider: 'openai',
      summary: parsed.summary || 'OpenAI analysis complete.',
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    };
  }

  async explainIssue(issue, codeContext) {
    if (!this.openai) throw new Error('OpenAI API key is not configured.');
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: `Explain this issue: ${JSON.stringify(issue)} in code: ${codeContext}` },
      ],
    });
    return {
      provider: 'openai',
      explanation: response.choices[0].message.content,
    };
  }

  async generateFix(issue, codeContext) {
    if (!this.openai) throw new Error('OpenAI API key is not configured.');
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'Return valid JSON: {"originalCode": "...", "suggestedCode": "...", "explanation": "..."}' },
        { role: 'user', content: `Fix issue: ${JSON.stringify(issue)} in code: ${codeContext}` },
      ],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(response.choices[0].message.content);
  }

  async chatAboutReview(message, history = [], reviewContext = {}) {
    if (!this.openai) throw new Error('OpenAI API key is not configured.');
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Context: ${JSON.stringify(reviewContext)}` },
        { role: 'user', content: message },
      ],
    });
    return {
      provider: 'openai',
      message: response.choices[0].message.content,
    };
  }
}

module.exports = OpenAIProvider;
