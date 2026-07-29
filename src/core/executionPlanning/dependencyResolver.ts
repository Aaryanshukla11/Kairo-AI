import { ExecutionStep } from './executionTypes';

export class DependencyResolver {
  public resolveDependencies(steps: ExecutionStep[]): Map<string, string[]> {
    const dependencyMap = new Map<string, string[]>();
    for (const step of steps) {
      dependencyMap.set(step.stepId, [...step.dependencies]);
    }
    return dependencyMap;
  }
}
export const dependencyResolver = new DependencyResolver();
