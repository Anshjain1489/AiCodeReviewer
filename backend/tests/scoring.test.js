const scoringService = require('../src/services/scoringService');

describe('ScoringService Unit Tests', () => {
  it('should return 100 for zero findings', () => {
    const scores = scoringService.calculateScores([], 50);
    expect(scores.overallScore).toBe(100);
    expect(scores.securityScore).toBe(100);
    expect(scores.bugScore).toBe(100);
  });

  it('should penalize security score heavily for critical security finding', () => {
    const findings = [
      { category: 'SECURITY', severity: 'CRITICAL', ruleId: 'eval-usage' },
      { category: 'SECURITY', severity: 'HIGH', ruleId: 'sql-injection' },
    ];
    const scores = scoringService.calculateScores(findings, 50);
    expect(scores.securityScore).toBeLessThan(70);
    expect(scores.overallScore).toBeLessThan(95);
  });
});
