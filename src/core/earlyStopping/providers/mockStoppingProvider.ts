import { StoppingPolicyConfig } from '../stoppingTypes';

export class MockStoppingProvider {
  public evaluate(
    config: StoppingPolicyConfig,
    mockImprovement: boolean,
    currentValue: number,
    bestValue: number
  ): { hasImproved: boolean; currentVal: number; delta: number } {
    const delta = config.mode === 'min' ? bestValue - currentValue : currentValue - bestValue;
    return {
      hasImproved: mockImprovement,
      currentVal: currentValue,
      delta
    };
  }
}

export const mockStoppingProvider = new MockStoppingProvider();
export default mockStoppingProvider;
