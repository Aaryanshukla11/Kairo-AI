import { RiskLevel, SecurityPolicyDecision } from './securityTypes';

export class SecurityPolicy {
  public evaluate(riskLevel: RiskLevel): SecurityPolicyDecision {
    switch (riskLevel) {
      case RiskLevel.Critical:
        return SecurityPolicyDecision.Block;
      case RiskLevel.High:
        return SecurityPolicyDecision.RequireApproval;
      case RiskLevel.Medium:
        return SecurityPolicyDecision.Warn;
      default:
        return SecurityPolicyDecision.Allow;
    }
  }
}

export const securityPolicy = new SecurityPolicy();
