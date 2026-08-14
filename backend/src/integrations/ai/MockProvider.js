const AIProvider = require('./AIProvider');

class MockProvider extends AIProvider {
  async analyzeCode(code, language, staticFindings = []) {
    const aiIssues = [];

    // Check code patterns for realistic mock AI insights
    if (code.includes('var ') || code.includes('function(')) {
      aiIssues.push({
        severity: 'LOW',
        category: 'MAINTAINABILITY',
        title: '[DEV MOCK AI] Legacy ES5 Syntax Detected',
        description: 'Code relies on legacy var declarations or un-arrow functions.',
        recommendation: 'Refactor var declarations to let/const and use arrow functions.',
        file: 'source.js',
        line: 1,
        column: 1,
        ruleId: 'mock-ai-es6-refactor',
        source: 'mock-ai',
        fingerprint: 'mock-ai-es6-1',
        impact: 'Reduces code readability and maintainability across modern JS runtimes.',
      });
    }

    if (!code.includes('try') && (code.includes('await') || code.includes('fetch') || code.includes('axios'))) {
      aiIssues.push({
        severity: 'HIGH',
        category: 'BUG',
        title: '[DEV MOCK AI] Missing Error Handling on Async Call',
        description: 'Asynchronous API or fetch call executed without enclosing try/catch block.',
        recommendation: 'Wrap async operations in a try/catch block to handle network and runtime failures.',
        file: 'source.js',
        line: 1,
        column: 1,
        ruleId: 'mock-ai-async-catch',
        source: 'mock-ai',
        fingerprint: 'mock-ai-async-1',
        impact: 'Unhandled promise rejections can crash the application process or hang request connections.',
      });
    }

    return {
      provider: 'mock-ai-dev-mode',
      summary: '[DEV MOCK AI] Analysis completed using development mock provider.',
      issues: aiIssues,
    };
  }

  async explainIssue(issue, codeContext) {
    return {
      provider: 'mock-ai-dev-mode',
      explanation: `[DEVELOPMENT MOCK MODE AI]
      
**Issue Title**: ${issue.title || 'Code Quality Issue'}
**Severity**: ${issue.severity} | **Category**: ${issue.category}

### Why this happens:
This issue occurs because the code breaks a recommended architectural rule or security standard. In development mock mode, this simulated explanation helps verify the drawer UI flow.

### Recommended Fix Strategy:
1. Identify the line at index ${issue.lineStart || 1}.
2. Apply input sanitization or defensive null/undefined checks.
3. Validate and re-run analysis.`,
    };
  }

  async generateFix(issue, codeContext) {
    const original = issue.description || codeContext || 'const x = 10;';
    const lineStart = issue.lineStart || 1;

    let suggested = codeContext;
    if (codeContext.includes('eval(')) {
      suggested = codeContext.replace(/eval\((.*?)\)/g, 'JSON.parse($1)');
    } else if (codeContext.includes('var ')) {
      suggested = codeContext.replace(/\bvar\b/g, 'const');
    } else {
      suggested = `// [DEV MOCK AI FIX APPLIED]\ntry {\n${codeContext}\n} catch (error) {\n  console.error("Safely caught error:", error);\n}`;
    }

    return {
      provider: 'mock-ai-dev-mode',
      originalCode: codeContext,
      suggestedCode: suggested,
      explanation: '[DEVELOPMENT MOCK MODE AI] Applied modern error boundary wrapper and safe syntax substitution.',
    };
  }

  async chatAboutReview(message, history = [], reviewContext = {}) {
    return {
      provider: 'mock-ai-dev-mode',
      message: `[DEVELOPMENT MOCK MODE AI] Received your question: "${message}". The review currently has a overall score of ${reviewContext.overallScore || 'N/A'} with ${reviewContext.totalIssues || 0} issues identified. How else can I assist with your code optimization?`,
    };
  }
}

module.exports = MockProvider;
