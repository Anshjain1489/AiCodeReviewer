const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIProvider = require('./AIProvider');
const logger = require('../../config/logger');

class GeminiProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async analyzeCode(code, language, staticFindings = []) {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured.');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `You are a senior full-stack security and code quality auditor. Analyze the following ${language} code.
    Existing static findings: ${JSON.stringify(staticFindings)}

    Code:
    \`\`\`${language}
    ${code}
    \`\`\`

    Respond ONLY in valid JSON matching this schema:
    {
      "summary": "High level review summary",
      "issues": [
        {
          "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
          "category": "BUG" | "SECURITY" | "PERFORMANCE" | "QUALITY" | "MAINTAINABILITY" | "COMPLEXITY" | "BEST_PRACTICE",
          "title": "Short title",
          "description": "Detailed explanation",
          "recommendation": "How to fix",
          "impact": "Why it matters",
          "file": "filename",
          "line": line_number,
          "column": col_number
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      return {
        provider: 'gemini',
        summary: parsed.summary || 'Gemini code analysis complete.',
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      };
    } catch (err) {
      logger.error('Failed to parse Gemini JSON output:', err, text);
      return {
        provider: 'gemini',
        summary: 'Gemini analysis executed.',
        issues: [],
      };
    }
  }

  async explainIssue(issue, codeContext) {
    if (!this.genAI) throw new Error('Gemini API key is not configured.');
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Explain the following code issue in beginner-friendly developer language.
    Issue: ${JSON.stringify(issue)}
    Code Context:
    ${codeContext}`;

    const result = await model.generateContent(prompt);
    return {
      provider: 'gemini',
      explanation: result.response.text(),
    };
  }

  async generateFix(issue, codeContext) {
    if (!this.genAI) throw new Error('Gemini API key is not configured.');
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `Generate a safe fix for this code issue. Return ONLY JSON:
    {
      "originalCode": "...",
      "suggestedCode": "...",
      "explanation": "..."
    }
    Issue: ${JSON.stringify(issue)}
    Code: ${codeContext}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return {
        originalCode: codeContext,
        suggestedCode: codeContext,
        explanation: 'Failed to generate automatic fix.',
      };
    }
  }

  async chatAboutReview(message, history = [], reviewContext = {}) {
    if (!this.genAI) throw new Error('Gemini API key is not configured.');
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an AI Code Review Assistant. Context: ${JSON.stringify(reviewContext)}. User Question: ${message}`;
    const result = await model.generateContent(prompt);
    return {
      provider: 'gemini',
      message: result.response.text(),
    };
  }
}

module.exports = GeminiProvider;
