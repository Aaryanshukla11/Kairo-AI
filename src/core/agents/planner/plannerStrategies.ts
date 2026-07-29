import { PlanningStrategyType } from './plannerTypes';

export class PlannerStrategies {
  /**
   * Identifies planning strategy type based on query keywords.
   */
  public resolveStrategy(prompt: string): PlanningStrategyType {
    const text = prompt.toLowerCase();
    if (text.includes('bug') || text.includes('fix') || text.includes('error') || text.includes('diagnose')) {
      return PlanningStrategyType.BugFix;
    }
    if (text.includes('refactor') || text.includes('clean') || text.includes('modular')) {
      return PlanningStrategyType.Refactoring;
    }
    if (text.includes('arch') || text.includes('system') || text.includes('design')) {
      return PlanningStrategyType.Architecture;
    }
    if (text.includes('doc') || text.includes('comment') || text.includes('readme')) {
      return PlanningStrategyType.Documentation;
    }
    if (text.includes('test') || text.includes('mocha') || text.includes('spec')) {
      return PlanningStrategyType.Testing;
    }
    return PlanningStrategyType.FeatureDevelopment;
  }
}

export const plannerStrategies = new PlannerStrategies();
