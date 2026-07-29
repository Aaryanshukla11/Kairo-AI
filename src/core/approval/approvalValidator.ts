import { ApprovalRequest, ApprovalStatus } from './approvalTypes';

export function canApprove(request: ApprovalRequest | undefined): boolean {
  if (!request) return false;
  return request.status === ApprovalStatus.Pending;
}

export function canReject(request: ApprovalRequest | undefined): boolean {
  if (!request) return false;
  return request.status === ApprovalStatus.Pending;
}
