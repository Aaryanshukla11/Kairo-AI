import { ApprovalDecision, ApprovalLevel } from './approvalTypes';
import { approvalPolicies } from './approvalPolicies';

export class ApprovalResolver {
  public resolve(required: ApprovalLevel, userApproved: boolean): ApprovalDecision {
    if (required === 'Automatic') {
      return { requiredLevel: required, granted: true, reason: 'Automatic execution permitted.' };
    }
    const granted = userApproved;
    return {
      requiredLevel: required,
      granted,
      actualApproverRole: userApproved ? 'Administrator' : 'None',
      reason: granted
        ? `Explicit user approval granted and resolved as Administrator.`
        : `Requires approval at level: ${required}.`
    };
  }
}
export const approvalResolver = new ApprovalResolver();
