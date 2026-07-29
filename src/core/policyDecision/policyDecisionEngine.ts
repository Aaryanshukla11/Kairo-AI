import { PolicyDecisionInput, PolicyDecisionReport } from './policyTypes';
import { policyEvaluators } from './policyEvaluators';

export class PolicyDecisionEngine {
  public decide(input: PolicyDecisionInput): PolicyDecisionReport {
    const outcome = policyEvaluators.evaluate(input);
    return {
      decision: outcome.decision,
      reason: outcome.reason,
      violations: outcome.violations,
      warnings: outcome.warnings,
      timestamp: Date.now()
    };
  }
}
export const policyDecisionEngine = new PolicyDecisionEngine();
