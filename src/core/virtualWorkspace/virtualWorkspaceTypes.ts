export interface VirtualFile {
  path: string;
  content: string;
}

export interface VirtualDirectory {
  path: string;
  files: Map<string, VirtualFile>;
  subdirectories: Map<string, VirtualDirectory>;
}

export interface VirtualWorkspaceReport {
  clonedFilesCount: number;
  syntaxVerificationPassed: boolean;
  importsVerified: boolean;
  symbolsVerified: boolean;
  dependenciesVerified: boolean;
  diffOperations: string[];
  timestamp: number;
}
