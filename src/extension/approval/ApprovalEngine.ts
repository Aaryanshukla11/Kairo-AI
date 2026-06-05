import { ApprovalRequest, ApprovalDecision, ApprovalStatus, ApprovalValidator, ApprovalFactory, ApprovalAction } from '../../common/approval';
import { RiskLevel } from '../../common/planner/RiskLevel';

export class ApprovalEngine {
  /**
   * Generates a new Approval Request for a given Plan payload.
   */
  public createRequest(sessionId: string, planId: string, riskLevel: RiskLevel, actions: ApprovalAction[]): ApprovalRequest {
    const request = ApprovalFactory.create(
      sessionId,
      planId,
      'Execution Approval Required',
      'This plan contains actions that modify your workspace and requires explicit approval.',
      'Summary of requested actions.',
      riskLevel,
      actions
    );

    const validation = ApprovalValidator.validate(request);
    if (!validation.valid) {
      throw new Error(`ApprovalRequest validation failed: ${validation.errors.join(', ')}`);
    }

    return request;
  }

  /**
   * Evaluates the decision and updates the immutable Request returning a new frozen instance.
   */
  public evaluateDecision(request: ApprovalRequest, decision: ApprovalDecision): ApprovalRequest {
    const updatedStatus = decision === ApprovalDecision.APPROVE 
      ? ApprovalStatus.APPROVED 
      : ApprovalStatus.REJECTED;

    const resolvedRequest: ApprovalRequest = {
      ...request,
      status: updatedStatus,
      metadata: {
        ...request.metadata,
        resolvedAt: Date.now()
      }
    };

    return Object.freeze(resolvedRequest);
  }

  public expireRequest(request: ApprovalRequest): ApprovalRequest {
    return Object.freeze({
      ...request,
      status: ApprovalStatus.EXPIRED,
      metadata: {
        ...request.metadata,
        resolvedAt: Date.now()
      }
    });
  }

  public cancelRequest(request: ApprovalRequest): ApprovalRequest {
    return Object.freeze({
      ...request,
      status: ApprovalStatus.CANCELLED,
      metadata: {
        ...request.metadata,
        resolvedAt: Date.now()
      }
    });
  }
}
