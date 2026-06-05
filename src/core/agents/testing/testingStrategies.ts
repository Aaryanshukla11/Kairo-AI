import { RiskLevel, TestType } from './testingTypes';

export class TestingStrategies {
  /**
   * Resolves the risk level based on the list of affected files.
   */
  public determineRiskLevel(affectedFiles: string[]): RiskLevel {
    if (!affectedFiles || affectedFiles.length === 0) {
      return RiskLevel.Minimal;
    }

    let hasCore = false;
    let hasUI = false;
    let hasSecurity = false;

    for (const file of affectedFiles) {
      const lower = file.toLowerCase();
      if (lower.includes('security') || lower.includes('permission') || lower.includes('auth')) {
        hasSecurity = true;
      } else if (lower.includes('src/core/agents/') || lower.includes('src/core/')) {
        hasCore = true;
      } else if (lower.includes('src/webview/') || lower.includes('components/')) {
        hasUI = true;
      }
    }

    if (hasSecurity) return RiskLevel.Critical;
    if (hasCore) return RiskLevel.High;
    if (hasUI) return RiskLevel.Medium;
    
    return RiskLevel.Low;
  }

  /**
   * Recommends testing types based on the resolved risk level.
   */
  public recommendTestTypes(riskLevel: RiskLevel): TestType[] {
    switch (riskLevel) {
      case RiskLevel.Critical:
        return [TestType.Unit, TestType.Integration, TestType.Regression, TestType.Smoke, TestType.StaticAnalysis];
      case RiskLevel.High:
        return [TestType.Unit, TestType.Integration, TestType.Regression, TestType.StaticAnalysis];
      case RiskLevel.Medium:
        return [TestType.Unit, TestType.Smoke, TestType.Accessibility];
      case RiskLevel.Low:
        return [TestType.Unit, TestType.StaticAnalysis];
      default:
        return [TestType.Smoke];
    }
  }
}

export const testingStrategies = new TestingStrategies();
