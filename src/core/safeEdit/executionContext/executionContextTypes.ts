export interface ExecutionContext {
  workspaceStatus: 'clean' | 'dirty';
  gitStatus: string;
  currentBranch: string;
  uncommittedChanges: number;
  activeEditors: string[];
  lockedFiles: string[];
  backgroundTasks: string[];
  runningTerminalCommands: string[];
  os: string;
  diskSpace: { free: number; total: number };
  memory: { free: number; total: number };
  cpuLoad: number;
  workspaceSnapshotId: string;
  currentUser: string;
  executionTimestamp: number;
}
