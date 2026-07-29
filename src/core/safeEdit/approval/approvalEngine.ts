import { PatchType } from '../classification/classificationTypes';
import { RiskGraphData } from '../riskGraph/riskTypes';
import { ApprovalDecision } from './approvalTypes';
import { approvalMatrix } from './approvalMatrix';
import { approvalResolver } from './approvalResolver';

export class ApprovalEngine {
  public resolveApproval(patchType: PatchType, risk: RiskGraphData['overallRiskLevel'], userApproved: boolean): ApprovalDecision {
    const required = approvalMatrix.determineRequiredLevel(patchType, risk);
    return approvalResolver.resolve(required, userApproved);
  }
}
export const approvalEngine = new ApprovalEngine();
