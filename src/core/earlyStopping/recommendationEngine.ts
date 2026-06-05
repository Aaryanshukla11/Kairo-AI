import { RecommendationReport, StoppingPolicyConfig, StoppingDecision } from './stoppingTypes';

export class RecommendationEngine {
  public generateRecommendation(
    policyConfig: StoppingPolicyConfig,
    decision: StoppingDecision,
    plateauLength: number,
    isOverfitting: boolean,
    convergenceStagnated: boolean
  ): RecommendationReport {
    const reasoning: string[] = [];
    let recommendation = 'Maintain current training settings.';
    let suggestedAction = 'continue';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let confidence = 0.95;

    if (decision.decision === 'stop') {
      recommendation = `Terminate the training run immediately. The metric "${policyConfig.metric}" has stagnated beyond the patience window.`;
      suggestedAction = 'stop';
      severity = 'critical';
      confidence = 0.99;
      reasoning.push(`Metric "${policyConfig.metric}" exceeded patience limit of ${policyConfig.patienceWindow} steps.`);
      reasoning.push(`No performance improvements registered for the past ${decision.stepsSinceImprovement} evaluations.`);
    } else if (isOverfitting) {
      recommendation = 'Decrease the learning rate or increase regularization parameters (dropout, weight decay).';
      suggestedAction = 'pause_and_review';
      severity = 'high';
      confidence = 0.85;
      reasoning.push('Validation loss is increasing while training loss continues to decline.');
      reasoning.push('Significant generalization gap is expanding.');
    } else if (decision.decision === 'checkpoint_and_continue') {
      recommendation = 'Save a recovery checkpoint to prevent loss of progress during metric instability.';
      suggestedAction = 'save_checkpoint';
      severity = 'medium';
      confidence = 0.90;
      reasoning.push(`Metric is plateauing (${decision.stepsSinceImprovement} steps since last improvement).`);
    } else if (convergenceStagnated) {
      recommendation = 'Consider decaying the learning rate or stopping early. Training loss has flatlined.';
      suggestedAction = 'decay_lr_or_stop';
      severity = 'medium';
      confidence = 0.80;
      reasoning.push('Training loss convergence rate of change has dropped below stagnation threshold.');
    } else if (plateauLength > 0) {
      recommendation = 'Monitor metrics closely. A validation plateau is forming.';
      suggestedAction = 'monitor';
      severity = 'low';
      confidence = 0.75;
      reasoning.push(`Validation metric flatlined for ${plateauLength} steps.`);
    } else {
      reasoning.push('Model convergence metrics are within acceptable parameters.');
    }

    return {
      recommendation,
      severity,
      confidence,
      reasoning,
      suggestedAction
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
export default recommendationEngine;
