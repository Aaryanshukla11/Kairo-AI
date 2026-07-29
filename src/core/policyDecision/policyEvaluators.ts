import { PolicyDecisionInput, PolicyDecisionType } from './policyTypes';

export class PolicyEvaluators {
  public evaluate(input: PolicyDecisionInput): { decision: PolicyDecisionType; reason: string; violations: string[]; warnings: string[] } {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Rule 1: High overall risk score blocks/rejects execution
    if (input.riskGraph.overallRiskScore >= 80) {
      violations.push('RISK-01: Risk score equals or exceeds Critical threshold.');
      return { decision: 'Block', reason: 'High overall risk score restricts execution.', violations, warnings };
    }

    // Rule 2: Unapproved high risk requires approval
    if (input.riskGraph.overallRiskScore >= 40 && !input.approval) {
      violations.push('APPROVAL-02: User approval missing for medium/high risk operations.');
      return { decision: 'Approval Required', reason: 'Approval required for execution.', violations, warnings };
    }

    // Rule 3: File locks or dirty workspace state triggers Warn
    if (input.workspaceContext.workspaceStatus === 'dirty') {
      warnings.push('WORKSPACE-02: Executing on top of uncommitted workspace changes.');
    }

    const decision: PolicyDecisionType = violations.length > 0
      ? 'Reject'
      : warnings.length > 0
        ? 'Warn'
        : 'Allow';

    return {
      decision,
      reason: decision === 'Allow' ? 'Policy checks passed successfully.' : 'Policy warnings detected.',
      violations,
      warnings
    };
  }
}
export const policyEvaluators = new PolicyEvaluators();
