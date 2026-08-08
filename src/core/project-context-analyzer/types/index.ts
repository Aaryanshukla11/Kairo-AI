export interface IWorkspaceInfo {
  readonly isEmpty: boolean;
  readonly isProjectPresent: boolean;
  readonly isMonorepo: boolean;
  readonly appsCount: number;
  readonly packagesCount: number;
  readonly hasGit: boolean;
  readonly packageManager: string | null;
}

export interface ITechStackInfo {
  readonly language: string | null;
  readonly frontendFramework: string | null;
  readonly backendFramework: string | null;
  readonly database: string | null;
  readonly orm: string | null;
  readonly authLibrary: string | null;
  readonly uiLibrary: string | null;
  readonly cssFramework: string | null;
  readonly stateManagement: string | null;
  readonly testingFramework: string | null;
  readonly buildTool: string | null;
}

export interface IDependencyInfo {
  readonly installed: Readonly<Record<string, string>>;
  readonly missing: readonly string[];
  readonly unused: readonly string[];
  readonly peerIssues: readonly string[];
}

export interface IProjectContextOutput {
  readonly workspace: IWorkspaceInfo;
  readonly projectType: string;
  readonly techStack: ITechStackInfo;
  readonly importantFiles: readonly string[];
  readonly entryPoints: readonly string[];
  readonly dependencies: IDependencyInfo;
  readonly projectHealth: 'Healthy' | 'Missing Dependencies' | 'Configuration Error' | 'Invalid Build' | 'Broken Project' | 'Incomplete Project';
}
