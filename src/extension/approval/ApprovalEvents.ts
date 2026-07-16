import { ApprovalRequest } from '../../common/approval';

export enum ApprovalEventType {
  REQUEST_CREATED = 'REQUEST_CREATED',
  DECISION_ACCEPTED = 'DECISION_ACCEPTED',
  DECISION_REJECTED = 'DECISION_REJECTED',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED',
  REQUEST_EXPIRED = 'REQUEST_EXPIRED'
}

export interface ApprovalEvent {
  type: ApprovalEventType;
  request: ApprovalRequest;
  timestamp: number;
}
