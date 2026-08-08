import { IEngineeringDecision } from '../../engineering-decision';

export class PatternSelector {
  public selectPatterns(decision: IEngineeringDecision): string[] {
    const patterns: string[] = ['Dependency Injection', 'Repository Pattern'];

    if (decision.profile.architecturePattern === 'Clean Architecture') {
      patterns.push('Factory Pattern', 'Adapter Pattern', 'Facade Pattern');
    }

    if (decision.authentication.primary === 'JWT') {
      patterns.push('Strategy Pattern (Auth Strategy)');
    }

    return patterns;
  }
}

export const patternSelector = new PatternSelector();
export default patternSelector;
