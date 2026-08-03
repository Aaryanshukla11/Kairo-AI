import { ImpactAnalysisResult } from './replanningTypes';

export class ReplanningAnalyzer {
  generateRecoverySuggestions(impact: ImpactAnalysisResult): string[] {
    const suggestions: string[] = [];

    if (impact.affectedTaskIds.length > 0) {
      suggestions.push(`Re-verify dependencies for affected stages: ${impact.affectedTaskIds.join(', ')}`);
    }
    if (impact.preservedTaskIds.length > 0) {
      suggestions.push(`Preserve completed execution state for stages: ${impact.preservedTaskIds.join(', ')}`);
    }
    suggestions.push(`Re-evaluate execution graph confidence metrics.`);

    return suggestions;
  }
}

export const replanningAnalyzer = new ReplanningAnalyzer();
