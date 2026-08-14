const BaseAnalyzer = require('./BaseAnalyzer');

class RuleAnalyzer extends BaseAnalyzer {
  getName() {
    return 'rule-engine';
  }

  async analyze(code, options = {}) {
    const filename = options.filename || 'source.js';
    const findings = [];
    const lines = code.split('\n');

    const securityRules = [
      {
        id: 'sec-eval-usage',
        pattern: /\beval\s*\(/i,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Use of eval() function',
        description: 'Executing arbitrary code via eval() introduces severe Remote Code Execution (RCE) vulnerabilities.',
        recommendation: 'Refactor code to avoid dynamic code execution.',
        impact: 'Attacker could execute malicious commands on the server or browser.',
      },
      {
        id: 'sec-hardcoded-secret',
        pattern: /(api_key|secret|password|private_key|jwt_secret)\s*[:=]\s*['"`][A-Za-z0-9_\-]{8,}['"`]/i,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Hardcoded Secret / API Key',
        description: 'Plaintext secret or API key identified directly in source code.',
        recommendation: 'Move sensitive credentials to environment variables (.env).',
        impact: 'Exposing credentials in source repositories can lead to unauthorized system compromise.',
      },
      {
        id: 'sec-sql-injection',
        pattern: /(SELECT|INSERT|UPDATE|DELETE)\s+.*\$\{\s*.*\}|WHERE\s+.*\+\s*[a-zA-Z_$]/i,
        severity: 'HIGH',
        category: 'SECURITY',
        title: 'Potential SQL Injection',
        description: 'Dynamic string interpolation or concatenation inside raw SQL queries.',
        recommendation: 'Use parameterized queries or Prisma ORM prepared statements.',
        impact: 'Attackers can manipulate database queries to exfiltrate or mutate data.',
      },
      {
        id: 'sec-xss-danger',
        pattern: /dangerouslySetInnerHTML|innerHTML\s*=\s*/i,
        severity: 'HIGH',
        category: 'SECURITY',
        title: 'Potential Cross-Site Scripting (XSS)',
        description: 'Direct assignment to innerHTML or dangerouslySetInnerHTML without sanitization.',
        recommendation: 'Sanitize HTML input using DOMPurify before rendering.',
        impact: 'Attackers can execute unauthorized JavaScript in user browsers.',
      },
      {
        id: 'bug-unhandled-promise',
        pattern: /new Promise\s*\([^)]*\)\s*(?!.*\.catch)/i,
        severity: 'MEDIUM',
        category: 'BUG',
        title: 'Unhandled Promise Rejection',
        description: 'Promise created without explicit rejection handler or try/catch wrapper.',
        recommendation: 'Add .catch() or wrap async operation in a try/catch block.',
        impact: 'May cause unhandled rejection crashes or silent request hangs.',
      },
      {
        id: 'perf-sync-fs',
        pattern: /fs\.readFileSync|fs\.writeFileSync|fs\.existsSync/i,
        severity: 'LOW',
        category: 'PERFORMANCE',
        title: 'Synchronous I/O Blocking Call',
        description: 'Synchronous filesystem operations block the Node.js main event loop.',
        recommendation: 'Use asynchronous promises-based fs/promises methods.',
        impact: 'Reduces request throughput under concurrent server traffic.',
      },
    ];

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;

      for (const rule of securityRules) {
        if (rule.pattern.test(lineText)) {
          findings.push(
            this.normalizeFinding({
              severity: rule.severity,
              category: rule.category,
              title: rule.title,
              description: rule.description,
              file: filename,
              line: lineNum,
              column: lineText.search(rule.pattern) + 1,
              ruleId: rule.id,
              source: 'rule-engine',
              recommendation: rule.recommendation,
              impact: rule.impact,
            })
          );
        }
      }
    });

    return findings;
  }
}

module.exports = RuleAnalyzer;
