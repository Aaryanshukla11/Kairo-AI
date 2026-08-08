export interface IWorkspacePackage {
  name: string;
  location: string;
  purpose: string;
  dependencies: string[];
  visibility: 'PUBLIC' | 'PRIVATE';
}

export interface IFolderNode {
  path: string;
  purpose: string;
  ownerGeneratorId: string;
}

export interface IScaffoldingStep {
  name: string;
  description: string;
  targetPath: string;
  generatorId: string;
  executionPriority: number;
}

export interface IWorkspaceBlueprint {
  readonly workspaceType: 'SingleApplication' | 'Monorepo' | 'MultiPackage';
  readonly packages: IWorkspacePackage[];
  readonly folders: IFolderNode[];
  readonly ownershipMap: Record<string, string>; // folder path -> generator ID
  readonly dependencyRules: string[];
  readonly buildStrategy: string;
  readonly configurationLocations: Record<string, string>; // config key -> folder path
  readonly scaffoldingPlan: {
    steps: IScaffoldingStep[];
  };
  readonly validationReport: {
    isValid: boolean;
    violations: string[];
  };
}
