import { ApprovalLevel } from './approvalTypes';

export class ApprovalPolicies {
  public satisfies(required: ApprovalLevel, actual: string): boolean {
    const weights: Record<ApprovalLevel, number> = {
      'Automatic': 0,
      'User': 1,
      'Workspace': 2,
      'Repository': 3,
      'Branch': 4,
      'Organization': 5,
      'Administrator': 6,
      'Emergency Override': 7
    };
    const reqWeight = weights[required] || 0;
    const actWeight = weights[actual as ApprovalLevel] || 0;
    return actWeight >= reqWeight;
  }
}
export const approvalPolicies = new ApprovalPolicies();
