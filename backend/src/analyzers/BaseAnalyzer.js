const crypto = require('crypto');

class BaseAnalyzer {
  getName() {
    throw new Error('getName() must be implemented by subclass');
  }

  getSupportedLanguages() {
    return ['javascript', 'js', 'jsx', 'typescript', 'ts'];
  }

  async analyze(code, options = {}) {
    throw new Error('analyze() must be implemented by subclass');
  }

  createFingerprint(filePath, line, column, ruleId) {
    const rawStr = `${filePath}:${line}:${column}:${ruleId}`;
    return crypto.createHash('sha256').update(rawStr).digest('hex').substring(0, 16);
  }

  normalizeFinding({
    severity = 'MEDIUM',
    category = 'QUALITY',
    title,
    description,
    file = 'input.js',
    line = 1,
    column = 1,
    ruleId = 'generic-rule',
    source = this.getName(),
    recommendation = '',
    impact = '',
  }) {
    const normSeverity = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(severity.toUpperCase())
      ? severity.toUpperCase()
      : 'MEDIUM';

    const normCategory = ['BUG', 'SECURITY', 'PERFORMANCE', 'QUALITY', 'MAINTAINABILITY', 'COMPLEXITY', 'BEST_PRACTICE'].includes(category.toUpperCase())
      ? category.toUpperCase()
      : 'QUALITY';

    return {
      severity: normSeverity,
      category: normCategory,
      title: title || 'Code Quality Observation',
      description: description || '',
      file,
      line: line ? parseInt(line, 10) : 1,
      column: column ? parseInt(column, 10) : 1,
      ruleId,
      source,
      fingerprint: this.createFingerprint(file, line, column, ruleId),
      recommendation,
      impact,
    };
  }
}

module.exports = BaseAnalyzer;
