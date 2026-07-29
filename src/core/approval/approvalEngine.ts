import { ExecutionPlan } from '../planner/types';
import { ApprovalRequest, ApprovalStatus } from './approvalTypes';
import { canApprove, canReject } from './approvalValidator';

export class ApprovalEngine {
  private registry: Map<string, ApprovalRequest> = new Map();

  public createApproval(plan: ExecutionPlan): ApprovalRequest {
    const id = `approval-${Date.now()}`;
    const approval: ApprovalRequest = {
      id,
      planId: plan.id,
      title: `Approve: ${plan.title}`,
      summary: plan.summary,
      riskLevel: plan.riskLevel,
      createdAt: Date.now(),
      status: ApprovalStatus.Pending
    };

    this.registry.set(id, approval);
    return approval;
  }

  public getApproval(id: string): ApprovalRequest | undefined {
    return this.registry.get(id);
  }

  public approve(id: string): ApprovalRequest {
    const approval = this.registry.get(id);
    if (!approval) {
      throw new Error(`Cannot approve non-existent plan approval: ${id}`);
    }

    if (!canApprove(approval)) {
      throw new Error(`Cannot approve plan in status: ${approval.status}`);
    }

    approval.status = ApprovalStatus.Approved;
    return approval;
  }

  public reject(id: string): ApprovalRequest {
    const approval = this.registry.get(id);
    if (!approval) {
      throw new Error(`Cannot reject non-existent plan approval: ${id}`);
    }

    if (!canReject(approval)) {
      throw new Error(`Cannot reject plan in status: ${approval.status}`);
    }

    approval.status = ApprovalStatus.Rejected;
    return approval;
  }
}

export const approvalEngine = new ApprovalEngine();
