import { ApprovalRequest } from './ApprovalRequest';
import { ApprovalStatus } from './ApprovalStatus';
import { ApprovalAction } from './ApprovalAction';
import { RiskLevel } from '../planner/RiskLevel';
import { randomUUID } from 'crypto';

export class ApprovalFactory {
  public static create(
    sessionId: string,
    planId: string,
    title: string,
    description: string,
    summary: string,
    riskLevel: RiskLevel,
    actions: ApprovalAction[]
  ): ApprovalRequest {
    const request: ApprovalRequest = {
      id: randomUUID(),
      sessionId,
      planId,
      createdAt: Date.now(),
      title,
      description,
      summary,
      riskLevel,
      actions,
      status: ApprovalStatus.CREATED,
      metadata: {
        requestedAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours expiry
        engineVersion: '1.0.0'
      }
    };

    return Object.freeze(request);
  }
}
