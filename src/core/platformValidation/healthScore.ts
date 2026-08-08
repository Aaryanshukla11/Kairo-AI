import { PlatformHealthReport, SubsystemHealth, ValidationResult } from './validationTypes';

export class HealthScore {
  public calculateHealth(
    results: Record<string, ValidationResult>,
    historyReports: PlatformHealthReport[]
  ): PlatformHealthReport {
    const subsystems: Record<string, SubsystemHealth> = {};
    const criticalFailures: string[] = [];
    const recoveryRecommendations: string[] = [];

    // Define target subsystems mapped to their checks
    const targetSubsystems = [
      'Architecture',
      'Dataset',
      'Training',
      'Runtime',
      'Events',
      'Memory',
      'Registries',
      'Providers',
      'Dashboards'
    ];

    let totalScoreSum = 0;
    let countedSubsystems = 0;

    for (const subName of targetSubsystems) {
      // Find checks matching this subsystem
      const checks = Object.values(results).filter(
        r => r.name.toLowerCase().includes(subName.toLowerCase()) || 
             (r as any).targetSubsystem?.toLowerCase() === subName.toLowerCase()
      );

      let score = 100;
      let status: 'Healthy' | 'Degraded' | 'Unhealthy' = 'Healthy';
      const errors: string[] = [];
      const warnings: string[] = [];
      const metrics: Record<string, number> = {};

      if (checks.length > 0) {
        const scoreSum = checks.reduce((acc, curr) => acc + curr.score, 0);
        score = Math.round(scoreSum / checks.length);
        
        for (const check of checks) {
          if (check.errors) errors.push(...check.errors);
          if (check.warnings) warnings.push(...check.warnings);
          if (check.metrics) {
            Object.assign(metrics, check.metrics);
          }
        }
      } else {
        // Default healthy simulation if no checks ran yet
        score = 100;
      }

      if (score < 60) {
        status = 'Unhealthy';
        criticalFailures.push(`Subsystem '${subName}' is Unhealthy with score ${score}%.`);
      } else if (score < 90) {
        status = 'Degraded';
      }

      subsystems[subName] = {
        score,
        status,
        lastValidated: Date.now(),
        metrics,
        checksCount: Math.max(1, checks.length),
        passedChecks: checks.filter(c => c.status === 'Passed').length,
        failedChecks: checks.filter(c => c.status === 'Failed').length,
        errors,
        warnings
      };

      totalScoreSum += score;
      countedSubsystems++;
    }

    const overallScore = Math.round(totalScoreSum / countedSubsystems);

    // Calculate Trend Analysis
    let trend: 'Improving' | 'Stable' | 'Declining' = 'Stable';
    if (historyReports.length > 0) {
      const prevScore = historyReports[historyReports.length - 1].overallScore;
      if (overallScore > prevScore) trend = 'Improving';
      else if (overallScore < prevScore) trend = 'Declining';
    }

    // Risk level calculation
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (criticalFailures.length > 0 || overallScore < 60) {
      riskLevel = 'Critical';
    } else if (overallScore < 80) {
      riskLevel = 'High';
    } else if (overallScore < 92) {
      riskLevel = 'Medium';
    }

    // Build recovery recommendations
    for (const [subName, info] of Object.entries(subsystems)) {
      if (info.status === 'Unhealthy') {
        recoveryRecommendations.push(`Immediate Action: Resolve errors in '${subName}' subsystem to restore overall platform stability.`);
        if (info.errors.length > 0) {
          recoveryRecommendations.push(`- Fix: ${info.errors[0]}`);
        }
      } else if (info.status === 'Degraded') {
        recoveryRecommendations.push(`Recommendation: Review warnings in '${subName}' subsystem (current score: ${info.score}%).`);
      }
    }

    if (recoveryRecommendations.length === 0) {
      recoveryRecommendations.push('System is optimal. Maintain current architectural patterns.');
    }

    return {
      timestamp: Date.now(),
      overallScore,
      subsystems,
      trend,
      riskLevel,
      criticalFailures,
      recoveryRecommendations
    };
  }
}

export const healthScore = new HealthScore();
