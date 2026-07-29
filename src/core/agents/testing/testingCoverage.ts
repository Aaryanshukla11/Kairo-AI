import { TestPlan } from './testingTypes';

export class TestingCoverage {
  /**
   * Estimates code coverage percentage based on plan risk levels and files count.
   */
  public estimate(plan: TestPlan): number {
    const totalModules = plan.affectedModules.length || 1;
    const targetsCount = plan.targetPaths.length || 1;

    let base = 65;
    if (plan.riskLevel === 'Minimal') {
      base = 88;
    } else if (plan.riskLevel === 'Low') {
      base = 80;
    } else if (plan.riskLevel === 'Medium') {
      base = 74;
    } else if (plan.riskLevel === 'High') {
      base = 68;
    }

    const bonus = Math.min(12, (targetsCount / totalModules) * 4);
    return Math.min(100, Math.round(base + bonus));
  }
}

export const testingCoverage = new TestingCoverage();
