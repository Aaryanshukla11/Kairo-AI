export enum DependencyType {
  Sequential = 'Sequential',
  Parallel = 'Parallel',
  Conditional = 'Conditional',
  Optional = 'Optional'
}

export interface ExecutionEdge {
  source: string;
  target: string;
  dependencyType: DependencyType;
}
