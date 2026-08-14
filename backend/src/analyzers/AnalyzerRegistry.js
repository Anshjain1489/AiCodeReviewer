const ESLintAnalyzer = require('./ESLintAnalyzer');
const SemgrepAnalyzer = require('./SemgrepAnalyzer');
const RuleAnalyzer = require('./RuleAnalyzer');
const logger = require('../config/logger');

class AnalyzerRegistry {
  constructor() {
    this.analyzers = [
      new ESLintAnalyzer(),
      new SemgrepAnalyzer(),
      new RuleAnalyzer(),
    ];
  }

  async runAll(code, options = {}) {
    let allFindings = [];

    for (const analyzer of this.analyzers) {
      try {
        const findings = await analyzer.analyze(code, options);
        if (Array.isArray(findings)) {
          allFindings.push(...findings);
        }
      } catch (err) {
        logger.error(`Analyzer ${analyzer.getName()} failed:`, err);
      }
    }

    return this.deduplicateFindings(allFindings);
  }

  deduplicateFindings(findings) {
    const seen = new Set();
    const result = [];

    for (const item of findings) {
      const key = `${item.file}:${item.line}:${item.column}:${item.ruleId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }
}

module.exports = new AnalyzerRegistry();
