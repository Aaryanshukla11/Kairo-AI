import { RiskLevel } from '../planner/RiskLevel';

export class ApprovalPolicy {
  public static requiresExplicitApproval(riskLevel: RiskLevel): boolean {
    return riskLevel === RiskLevel.MEDIUM || riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL;
  }
}
