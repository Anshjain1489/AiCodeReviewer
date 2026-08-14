const { ESLint } = require('eslint');
const BaseAnalyzer = require('./BaseAnalyzer');
const logger = require('../config/logger');

class ESLintAnalyzer extends BaseAnalyzer {
  getName() {
    return 'eslint';
  }

  mapESLintSeverity(severity, ruleId) {
    if (ruleId && (ruleId.includes('security') || ruleId.includes('eval') || ruleId.includes('no-implied-eval'))) {
      return 'HIGH';
    }
    return severity === 2 ? 'HIGH' : 'MEDIUM';
  }

  mapESLintCategory(ruleId) {
    if (!ruleId) return 'QUALITY';
    if (ruleId.includes('security') || ruleId.includes('eval')) return 'SECURITY';
    if (ruleId.includes('no-unused-vars') || ruleId.includes('no-undef')) return 'BUG';
    if (ruleId.includes('complexity') || ruleId.includes('max-depth')) return 'COMPLEXITY';
    return 'QUALITY';
  }

  async analyze(code, options = {}) {
    const filename = options.filename || 'source.js';
    const findings = [];

    try {
      const eslint = new ESLint({
        useEslintrc: false,
        overrideConfig: {
          env: { es2021: true, node: true, browser: true },
          parserOptions: { ecmaVersion: 12, sourceType: 'module' },
          rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-unreachable': 'error',
            'no-constant-condition': 'warn',
            'eqeqeq': 'warn',
            'no-var': 'warn',
            'prefer-const': 'warn',
          },
        },
      });

      const results = await eslint.lintText(code, { filePath: filename });

      for (const result of results) {
        for (const msg of result.messages) {
          const ruleId = msg.ruleId || 'syntax-error';
          const severity = this.mapESLintSeverity(msg.severity, ruleId);
          const category = this.mapESLintCategory(ruleId);

          findings.push(
            this.normalizeFinding({
              severity,
              category,
              title: `ESLint: ${msg.message}`,
              description: msg.message,
              file: filename,
              line: msg.line || 1,
              column: msg.column || 1,
              ruleId,
              source: 'eslint',
              recommendation: `Fix rule violation: ${ruleId}`,
              impact: 'May cause runtime errors or maintainability debt.',
            })
          );
        }
      }
    } catch (err) {
      logger.warn('ESLint analysis failed on input code:', err.message);
    }

    return findings;
  }
}

module.exports = ESLintAnalyzer;
