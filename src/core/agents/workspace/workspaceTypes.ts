export type WorkspaceAgentStage =
  | 'WORKSPACE_ANALYSIS_STARTED'
  | 'EXISTING_WORKSPACE_DETECTION'
  | 'REPOSITORY_PLANNING'
  | 'PACKAGE_PLANNING'
  | 'OWNERSHIP_ASSIGNMENT'
  | 'WORKSPACE_VALIDATION'
  | 'WORKSPACE_BLUEPRINT_GENERATED'
  | 'BLUEPRINT_RETURNED';

export interface IWorkspaceAgentLog {
  readonly stage: WorkspaceAgentStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export type WorkspaceClassification =
  | 'Empty Workspace'
  | 'Existing Project'
  | 'Multi-root Workspace'
  | 'Monorepo'
  | 'Single Project';

export interface IPackageDefinition {
  readonly name: string;
  readonly path: string;
  readonly type: 'application' | 'package' | 'shared_library';
  readonly isAiManaged: boolean;
}

export interface IWorkspaceBlueprint {
  readonly requestId: string;
  readonly sessionId: string;
  readonly workspaceType: WorkspaceClassification;
  readonly repositoryLayout: {
    readonly rootPath: string;
    readonly isMonorepo: boolean;
    readonly packageManager: string;
  };
  readonly packageStructure: readonly IPackageDefinition[];
  readonly folderHierarchy: Record<string, any>;
  readonly sharedLibraries: readonly string[];
  readonly configurationMap: Record<string, string>;
  readonly buildStructure: {
    readonly outputDirectory: string;
    readonly scripts: Record<string, string>;
  };
  readonly aiManagedAreas: readonly string[];
  readonly userManagedAreas: readonly string[];
  readonly validationStatus: 'PASSED' | 'FAILED';
  readonly validationErrors?: readonly string[];
  readonly metadata: {
    readonly timestamp: number;
    readonly version: string;
  };
}
