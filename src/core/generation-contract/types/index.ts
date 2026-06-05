export type FileOperationType =
  | 'CREATE_FILE'
  | 'MODIFY_FILE'
  | 'DELETE_FILE'
  | 'RENAME_FILE'
  | 'MOVE_FILE'
  | 'NO_OPERATION';

export type DirectoryOperationType =
  | 'CREATE_DIRECTORY'
  | 'DELETE_DIRECTORY'
  | 'NO_OPERATION';

export interface IFileOperation {
  readonly operationId: string;
  readonly operationType: FileOperationType;
  readonly filePath: string;
  readonly relativePath: string;
  readonly language: string;
  readonly encoding: string; // e.g. "utf-8"
  readonly content: string;
  readonly hash?: string;
  readonly reason: string;
  readonly dependencies: readonly string[]; // operation IDs this depends on
}

export interface IDirectoryOperation {
  readonly directoryPath: string;
  readonly operationType: DirectoryOperationType;
  readonly reason: string;
}

export interface IGenerationContract {
  readonly contractVersion: string; // e.g. "1.0.0"
  readonly requestId: string;
  readonly executionId: string;
  readonly fileOperations: readonly IFileOperation[];
  readonly directoryOperations: readonly IDirectoryOperation[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly metadata: {
    readonly generator: string;
    readonly timestamp: number;
    readonly model: string;
    readonly projectId: string;
  };
}
