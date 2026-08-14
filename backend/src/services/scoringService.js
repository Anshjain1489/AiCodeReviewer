class ScoringService {
  calculateScores(findings = [], totalLines = 50) {
    const weights = {
      CRITICAL: 25,
      HIGH: 12,
      MEDIUM: 6,
      LOW: 2,
      INFO: 1,
    };

    const categoryPenalty = {
      SECURITY: 0,
      BUG: 0,
      PERFORMANCE: 0,
      MAINTAINABILITY: 0,
      QUALITY: 0,
      COMPLEXITY: 0,
      BEST_PRACTICE: 0,
    };

    for (const finding of findings) {
      const cat = (finding.category || 'QUALITY').toUpperCase();
      const sev = (finding.severity || 'MEDIUM').toUpperCase();
      const penalty = weights[sev] || 5;

      if (categoryPenalty[cat] !== undefined) {
        categoryPenalty[cat] += penalty;
      } else {
        categoryPenalty.QUALITY += penalty;
      }
    }

    // Base sub-scores calculation (scaled by density factor)
    const scaleFactor = Math.max(1, totalLines / 100);

    const securityScore = Math.max(0, Math.min(100, Math.round(100 - categoryPenalty.SECURITY / scaleFactor)));
    const bugScore = Math.max(0, Math.min(100, Math.round(100 - categoryPenalty.BUG / scaleFactor)));
    const performanceScore = Math.max(0, Math.min(100, Math.round(100 - categoryPenalty.PERFORMANCE / scaleFactor)));
    const maintainabilityScore = Math.max(
      0,
      Math.min(100, Math.round(100 - (categoryPenalty.MAINTAINABILITY + categoryPenalty.COMPLEXITY) / scaleFactor))
    );
    const qualityScore = Math.max(
      0,
      Math.min(100, Math.round(100 - (categoryPenalty.QUALITY + categoryPenalty.BEST_PRACTICE) / scaleFactor))
    );

    // Weighted Overall Score:
    // Security 25%, Bugs 25%, Maintainability 20%, Performance 15%, Code Quality 15%
    const overallScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          securityScore * 0.25 +
            bugScore * 0.25 +
            maintainabilityScore * 0.20 +
            performanceScore * 0.15 +
            qualityScore * 0.15
        )
      )
    );

    return {
      overallScore,
      securityScore,
      bugScore,
      performanceScore,
      maintainabilityScore,
      qualityScore,
    };
  }
}

module.exports = new ScoringService();
