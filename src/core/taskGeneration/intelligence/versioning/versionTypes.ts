export interface TaskVersionRecord {
  taskId: string;
  version: number;
  parentVersion?: number;
  isReplanned: boolean;
  reason: string;
  timestamp: number;
}
