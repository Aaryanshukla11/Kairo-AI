import { FolderInfo, FileInfo } from '../../common/workspace';

export interface WorkspaceSnapshot {
  readonly workspaceName: string;
  readonly rootPath: string;
  readonly framework: string;
  readonly languages: string[];
  readonly folderTree: FolderInfo[];
  readonly files: FileInfo[];
  readonly fileCount: number;
  readonly folderCount: number;
  readonly ignoredCount: number;
  readonly generatedAt: number;
}
