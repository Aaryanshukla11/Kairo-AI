export interface ILayerBoundary {
  name: string;
  responsibilities: string[];
  allowedDependencies: string[];
  forbiddenDependencies: string[];
}

export interface IModuleMetadata {
  name: string;
  purpose: string;
  interfaces: string[];
  dependencies: string[];
}

export interface IDependencyEdge {
  from: string;
  to: string;
}

export interface IArchitectureBlueprint {
  readonly systemArchitecture: string;
  readonly layers: ILayerBoundary[];
  readonly modules: IModuleMetadata[];
  readonly dependencyGraph: {
    nodes: string[];
    edges: IDependencyEdge[];
  };
  readonly communicationRules: string[];
  readonly designPatterns: string[];
  readonly namingConventions: Record<string, string>;
  readonly validationReport: {
    isValid: boolean;
    violations: string[];
  };
}
