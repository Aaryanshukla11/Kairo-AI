import { SafeEditInput } from './safeEditTypes';

export class PolicyEvaluator {
  public evaluatePolicies(input: SafeEditInput): { blocking: string[]; warnings: string[] } {
    const blocking: string[] = [];
    const warnings: string[] = [];
    const content = input.patchContent;

    // Check if direct dependencies modification
    if (content.includes('dependencies') && input.targetFile.includes('package.json')) {
      blocking.push('POLICY-01: Direct dependencies modification attempts blocked');
    }

    // Policy report checks
    if (input.policyReport) {
      if (!input.policyReport.compliant) {
        blocking.push(...input.policyReport.violations.map(v => `POLICY-02: ${v}`));
      }
      warnings.push(...input.policyReport.warnings.map(w => `POLICY-03: ${w}`));
    }

    // Check if security report has blocked actions
    if (input.securityReport && input.securityReport.blockedActions && input.securityReport.blockedActions.length > 0) {
      blocking.push(...input.securityReport.blockedActions.map(action => `POLICY-04: Blocked security action: ${action}`));
    }

    return { blocking, warnings };
  }
}

export const policyEvaluator = new PolicyEvaluator();
