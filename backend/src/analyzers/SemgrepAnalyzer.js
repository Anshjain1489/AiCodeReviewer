const { exec } = require('child_process');
const util = require('util');
const BaseAnalyzer = require('./BaseAnalyzer');
const RuleAnalyzer = require('./RuleAnalyzer');
const logger = require('../config/logger');

const execAsync = util.promisify(exec);

class SemgrepAnalyzer extends BaseAnalyzer {
  constructor() {
    super();
    this.fallbackAnalyzer = new RuleAnalyzer();
  }

  getName() {
    return 'semgrep';
  }

  async analyze(code, options = {}) {
    const filename = options.filename || 'source.js';
    
    // Attempt Semgrep CLI execution if installed
    try {
      const { stdout } = await execAsync(`semgrep --config=auto --quiet --json -`, {
        input: code,
        timeout: 5000,
      });
      const parsed = JSON.parse(stdout);
      if (parsed && Array.isArray(parsed.results)) {
        return parsed.results.map((r) =>
          this.normalizeFinding({
            severity: r.extra?.severity === 'ERROR' ? 'HIGH' : 'MEDIUM',
            category: 'SECURITY',
            title: r.check_id || 'Semgrep Security Rule',
            description: r.extra?.message || r.check_id,
            file: filename,
            line: r.start?.line || 1,
            column: r.start?.col || 1,
            ruleId: r.check_id,
            source: 'semgrep',
            recommendation: r.extra?.metadata?.fix || 'Review rule documentation for secure coding pattern.',
            impact: r.extra?.metadata?.impact || 'Security risk identified by static analysis.',
          })
        );
      }
    } catch (err) {
      logger.info('Semgrep CLI binary unavailable or timed out; utilizing integrated rule engine adapter.');
    }

    // Fallback to integrated RuleAnalyzer
    return this.fallbackAnalyzer.analyze(code, options);
  }
}

module.exports = SemgrepAnalyzer;
