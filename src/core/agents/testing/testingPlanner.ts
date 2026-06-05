import { TestPlan, TestType, RiskLevel } from './testingTypes';

export class TestingPlanner {
  public createTestPlan(
    planId: string,
    riskLevel: RiskLevel,
    testTypes: TestType[],
    affectedFiles: string[]
  ): TestPlan {
    const affectedModules: string[] = [];
    const targetPaths: string[] = [];

    if (affectedFiles) {
      for (const file of affectedFiles) {
        // Extract modules
        const match = file.match(/src\/[^\/]+/);
        if (match) {
          affectedModules.push(match[0]);
        }
        
        // Target test file candidates
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          const testPath = file
            .replace('src/', 'tests/unit/')
            .replace('.tsx', '.test.tsx')
            .replace('.ts', '.test.ts');
          targetPaths.push(testPath);
        }
      }
    }

    return {
      planId,
      strategy: `Comprehensive ${riskLevel} Risk Testing Strategy`,
      riskLevel,
      testTypes,
      affectedModules: Array.from(new Set(affectedModules)),
      targetPaths: Array.from(new Set(targetPaths))
    };
  }
}

export const testingPlanner = new TestingPlanner();
