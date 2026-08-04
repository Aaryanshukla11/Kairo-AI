import { StoppingPolicyConfig } from '../stoppingTypes';

export class CustomPolicyProvider {
  public evaluate(
    payload: any,
    config: StoppingPolicyConfig,
    bestValue: number
  ): { hasImproved: boolean; currentVal: number; delta: number } {
    const currentVal = payload?.customValue !== undefined ? payload.customValue : bestValue;
    const minImprovement = config.minImprovement || 0.0001;

    let hasImproved = false;
    let delta = 0;

    if (config.mode === 'min') {
      delta = bestValue - currentVal;
      hasImproved = delta > minImprovement;
    } else {
      delta = currentVal - bestValue;
      hasImproved = delta > minImprovement;
    }

    return { hasImproved, currentVal, delta };
  }
}

export const customPolicyProvider = new CustomPolicyProvider();
export default customPolicyProvider;
