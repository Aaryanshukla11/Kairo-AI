import { SafeEditInput } from './safeEditTypes';

export class ApprovalCoordinator {
  public verifyApproval(input: SafeEditInput): { approved: boolean; blocking: string[] } {
    const isApproved = !!input.userApproved;
    const blocking: string[] = [];

    if (!isApproved) {
      blocking.push('APPROVAL-01: Execution requires explicit user approval');
    }

    return {
      approved: isApproved,
      blocking
    };
  }
}

export const approvalCoordinator = new ApprovalCoordinator();
