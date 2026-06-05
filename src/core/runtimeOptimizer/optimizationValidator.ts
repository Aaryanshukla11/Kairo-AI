import { RuntimeMetricsMap } from './optimizationTypes';

export class OptimizationValidator {
  public validate(before: RuntimeMetricsMap, after: RuntimeMetricsMap): void {
    if (after.cpuUsagePercent > 98) {
      throw new Error('Optimization validation error: High CPU allocation risk. Optimization plan rejected.');
    }

    if (after.ramUsageGb > 15.5) {
      throw new Error('Optimization validation error: Danger of System Out of Memory. RAM budget limit exceeded.');
    }

    if (after.tokensPerSec < before.tokensPerSec * 0.8) {
      throw new Error('Optimization validation error: Performance degraded below acceptable threshold.');
    }
  }
}

export const optimizationValidator = new OptimizationValidator();
