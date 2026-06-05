export interface RollbackReadinessCertificate {
  certificateId: string;
  affectedFiles: string[];
  affectedSymbols: string[];
  snapshots: string[];
  recoveryOrder: string[];
  dependencies: string[];
  estimatedRollbackTimeMs: number;
  rollbackConfidence: number;
  verificationResult: 'Success' | 'Failed' | 'Incomplete';
  timestamp: number;
}
