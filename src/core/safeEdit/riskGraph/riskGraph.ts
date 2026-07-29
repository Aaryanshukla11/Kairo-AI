import { SafeEditInput } from '../safeEditTypes';
import { RiskGraphData } from './riskTypes';
import { riskCalculator } from './riskCalculator';
import { riskAggregator } from './riskAggregator';

export class RiskGraph {
  public compute(input: SafeEditInput): RiskGraphData {
    const categories: RiskGraphData['categories'] = {
      filesystem: riskCalculator.calculateCategoryRisk('filesystem', input),
      architecture: riskCalculator.calculateCategoryRisk('architecture', input),
      security: riskCalculator.calculateCategoryRisk('security', input),
      dependency: riskCalculator.calculateCategoryRisk('dependency', input),
      workspace: riskCalculator.calculateCategoryRisk('workspace', input),
      terminal: riskCalculator.calculateCategoryRisk('terminal', input),
      policy: riskCalculator.calculateCategoryRisk('policy', input),
      rollback: riskCalculator.calculateCategoryRisk('rollback', input),
      approval: riskCalculator.calculateCategoryRisk('approval', input)
    };

    const aggregated = riskAggregator.aggregate(categories);

    return {
      categories,
      overallRiskScore: aggregated.score,
      overallRiskLevel: aggregated.level,
      overallConfidence: aggregated.confidence
    };
  }
}
export const riskGraph = new RiskGraph();
