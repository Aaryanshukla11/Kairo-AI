import { ApprovalStatus } from './ApprovalStatus';
import { ApprovalAction } from './ApprovalAction';
import { ApprovalMetadata } from './ApprovalMetadata';
import { RiskLevel } from '../planner/RiskLevel';

export interface ApprovalRequest {
  readonly id: string;
  readonly sessionId: string;
  readonly planId: string;
  readonly createdAt: number;
  readonly title: string;
  readonly description: string;
  readonly summary: string;
  readonly riskLevel: RiskLevel;
  readonly actions: ApprovalAction[];
  readonly status: ApprovalStatus;
  readonly metadata: ApprovalMetadata;
}
