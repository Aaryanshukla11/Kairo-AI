export type ApprovalLevel =
  | 'Automatic'
  | 'User'
  | 'Workspace'
  | 'Repository'
  | 'Branch'
  | 'Organization'
  | 'Administrator'
  | 'Emergency Override';

export interface ApprovalDecision {
  requiredLevel: ApprovalLevel;
  granted: boolean;
  actualApproverRole?: string;
  reason: string;
}
