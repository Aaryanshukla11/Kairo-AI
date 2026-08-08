export type ProjectManifestAgentStage =
  | 'MANIFEST_GENERATION_STARTED'
  | 'FILE_PLANNING'
  | 'OWNERSHIP_ASSIGNMENT'
  | 'DEPENDENCY_VALIDATION'
  | 'MANIFEST_VALIDATION'
  | 'MANIFEST_GENERATED'
  | 'MANIFEST_RETURNED';

export interface IProjectManifestAgentLog {
  readonly stage: ProjectManifestAgentStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IPlannedFile {
  readonly path: string;
  readonly module: string;
  readonly owner: string;
  readonly fileType: string;
  readonly isAiManaged: boolean;
  readonly isProtected: boolean;
}

export interface IProjectManifestObject {
  readonly requestId: string;
  readonly sessionId: string;
  readonly projectMetadata: {
    readonly name: string;
    readonly version: string;
    readonly category: string;
  };
  readonly workspaceMetadata: {
    readonly workspaceType: string;
    readonly rootPath: string;
    readonly isMonorepo: boolean;
    readonly packageManager: string;
  };
  readonly applicationList: readonly string[];
  readonly packageList: readonly string[];
  readonly moduleList: readonly string[];
  readonly plannedFolderTree: Record<string, any>;
  readonly plannedFileTree: readonly IPlannedFile[];
  readonly generatorOwnershipMap: Record<string, string>;
  readonly dependencyGraph: {
    readonly nodes: readonly { id: string; file: string }[];
    readonly edges: readonly { from: string; to: string }[];
    readonly valid: boolean;
  };
  readonly validationRules: readonly string[];
  readonly executionStages: readonly string[];
  readonly manifestVersion: string;
  readonly aiManagedFiles: readonly string[];
  readonly userManagedFiles: readonly string[];
  readonly protectedFiles: readonly string[];
  readonly validationStatus: 'PASSED' | 'FAILED';
  readonly validationErrors?: readonly string[];
  readonly metadata: {
    readonly timestamp: number;
    readonly version: string;
  };
}
