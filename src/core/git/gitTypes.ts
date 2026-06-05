export interface GitRepositoryInfo {
  root: string;
  branch: string;
  status: string;
  isDirty: boolean;
  ahead: number;
  behind: number;
  lastCommit?: string;
}

export interface GitChangedFile {
  path: string;
  status: 'Added' | 'Modified' | 'Deleted' | 'Untracked';
}

export interface GitStatusInfo {
  branch: string;
  isDirty: boolean;
  changedFiles: GitChangedFile[];
}

export interface GitCommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export enum GitEventType {
  RepositoryLoaded = 'RepositoryLoaded',
  StatusChanged = 'StatusChanged',
  CommitCreated = 'CommitCreated',
  DiffGenerated = 'DiffGenerated',
  BranchChanged = 'BranchChanged'
}

export interface GitEvent {
  type: GitEventType;
  repositoryRoot: string;
  timestamp: number;
  payload?: any;
}

export type GitEventListener = (event: GitEvent) => void;
