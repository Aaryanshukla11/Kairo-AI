import { RiskGraphData, CategoryRisk } from './riskTypes';

export class RiskAggregator {
  public aggregate(categories: RiskGraphData['categories']): { score: number; level: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical'; confidence: number } {
    const list: CategoryRisk[] = Object.values(categories);
    const sum = list.reduce((a, b) => a + b.score, 0);
    const overallScore = Math.min(100, Math.max(0, Math.round(sum / list.length)));
    
    let level: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical' = 'Minimal';
    if (overallScore <= 20) level = 'Minimal';
    else if (overallScore <= 40) level = 'Low';
    else if (overallScore <= 60) level = 'Medium';
    else if (overallScore <= 80) level = 'High';
    else level = 'Critical';

    const confidenceSum = list.reduce((a, b) => a + b.confidence, 0);
    const overallConfidence = confidenceSum / list.length;

    return { score: overallScore, level, confidence: overallConfidence };
  }
}
export const riskAggregator = new RiskAggregator();
