class AIProvider {
  async analyzeCode(code, language, staticFindings = []) {
    throw new Error('analyzeCode() must be implemented by subclass');
  }

  async explainIssue(issue, codeContext) {
    throw new Error('explainIssue() must be implemented by subclass');
  }

  async generateFix(issue, codeContext) {
    throw new Error('generateFix() must be implemented by subclass');
  }

  async chatAboutReview(message, history = [], reviewContext = {}) {
    throw new Error('chatAboutReview() must be implemented by subclass');
  }
}

module.exports = AIProvider;
