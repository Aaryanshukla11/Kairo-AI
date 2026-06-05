import { StoppingDecision, StoppingDecisionType, StoppingPolicyConfig } from './stoppingTypes';

export class StoppingDecisionEngine {
  public generateDecision(
    _sessionId: string,
    policyConfig: StoppingPolicyConfig,
    currentValue: number,
    bestValue: number,
    stepsSinceImprovement: number,
    plateauLength: number,
    isOverfitting: boolean
  ): StoppingDecision {
    const patienceWindow = policyConfig.patienceWindow;
    let decision: StoppingDecisionType = 'continue';
    let reason = 'Training is progressing normally and metrics are improving.';

    if (stepsSinceImprovement >= patienceWindow) {
      decision = 'stop';
      reason = `Stopping triggered: metric "${policyConfig.metric}" failed to improve for ${stepsSinceImprovement} consecutive steps (patience window of ${patienceWindow} exceeded).`;
    } else if (isOverfitting) {
      decision = 'require_manual_review';
      reason = `Critical validation divergence detected. Overfitting risk is high; training paused to review hyperparameter settings.`;
    } else if (stepsSinceImprovement > 0 && stepsSinceImprovement % Math.ceil(patienceWindow / 2) === 0) {
      // Periodic checkpoint during patience window
      decision = 'checkpoint_and_continue';
      reason = `Patience degradation in progress (${stepsSinceImprovement}/${patienceWindow} steps without improvement). Initiating checkpoint creation.`;
    } else if (plateauLength >= patienceWindow) {
      decision = 'pause';
      reason = `Plateau detected: metric "${policyConfig.metric}" has stagnated in range for ${plateauLength} steps. Paused to prevent unnecessary computations.`;
    }

    return {
      decision,
      reason,
      timestamp: Date.now(),
      evaluatedMetricValue: currentValue,
      bestMetricValue: bestValue,
      stepsSinceImprovement
    };
  }
}

export const stoppingDecisionEngine = new StoppingDecisionEngine();
export default stoppingDecisionEngine;
