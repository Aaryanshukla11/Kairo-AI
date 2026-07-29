import { Hypothesis, ConfidenceLevel } from './debugTypes';

export class HypothesisEngine {
  public generate(
    errorName: string,
    message: string,
    hasCritical: boolean
  ): Hypothesis[] {
    const list: Hypothesis[] = [];

    list.push({
      id: 'hyp-1',
      rank: 1,
      description: `Function signature mismatch or null reference error matching: ${errorName}`,
      confidence: hasCritical ? ConfidenceLevel.High : ConfidenceLevel.Medium,
      likelihood: hasCritical ? 85 : 70
    });

    list.push({
      id: 'hyp-2',
      rank: 2,
      description: 'Missing configuration setting or undefined environment constants variables.',
      confidence: ConfidenceLevel.Medium,
      likelihood: 48
    });

    list.push({
      id: 'hyp-3',
      rank: 3,
      description: 'Communication IPC bridge router timeout during message routing dispatch.',
      confidence: ConfidenceLevel.Low,
      likelihood: 22
    });

    return list;
  }
}

export const hypothesisEngine = new HypothesisEngine();
