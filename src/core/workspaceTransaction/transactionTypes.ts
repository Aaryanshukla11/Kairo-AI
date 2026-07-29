export type TransactionState = 'Active' | 'Committed' | 'Aborted';

export interface WorkspaceSnapshot {
  snapshotId: string;
  files: Record<string, string>; // fsPath -> content
  timestamp: number;
}

export interface TransactionJournalEntry {
  transactionId: string;
  operation: 'write' | 'delete' | 'create';
  filePath: string;
  previousContent?: string;
  newContent?: string;
  timestamp: number;
}

export interface TransactionReport {
  transactionId: string;
  state: TransactionState;
  openedAt: number;
  closedAt?: number;
  operationsCount: number;
  durationMs: number;
}

export interface SnapshotReport {
  snapshotId: string;
  filesCount: number;
  sizeBytes: number;
  timestamp: number;
}

export interface RecoveryReport {
  recoveredTransactionsCount: number;
  replayedEntriesCount: number;
  success: boolean;
}
