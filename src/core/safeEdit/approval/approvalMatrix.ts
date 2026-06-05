import { ApprovalLevel } from './approvalTypes';
import { PatchType } from '../classification/classificationTypes';
import { RiskGraphData } from '../riskGraph/riskTypes';

export class ApprovalMatrix {
  public determineRequiredLevel(patchType: PatchType, risk: RiskGraphData['overallRiskLevel']): ApprovalLevel {
    if (risk === 'Critical') return 'Administrator';
    if (risk === 'High') return 'Repository';
    if (patchType === 'Security' || patchType === 'Migration') return 'Branch';
    if (risk === 'Medium') return 'User';
    return 'Automatic';
  }
}
export const approvalMatrix = new ApprovalMatrix();
