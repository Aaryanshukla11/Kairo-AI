import { FileOperation } from './generationTypes';

export class DependencyPlanner {
  public planDependencies(ops: FileOperation[]): FileOperation[] {
    // Map dependencies based on imported file links if applicable
    return ops;
  }
}

export const dependencyPlanner = new DependencyPlanner();
