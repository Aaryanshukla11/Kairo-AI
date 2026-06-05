import { RiskLevel } from '../planner/types';

export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
  Expired = 'Expired'
}

export interface ApprovalRequest {
  id: string;
  planId: string;
  title: string;
  summary: string;
  riskLevel: RiskLevel;
  createdAt: number;
  status: ApprovalStatus;
}
