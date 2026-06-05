export interface ApprovalMetadata {
  requestedAt: number;
  resolvedAt?: number;
  expiresAt: number;
  engineVersion: string;
}
