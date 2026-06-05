import { virtualDependencies } from '../../virtualWorkspace/virtualDependencies';

export class DependencySimulator {
  public simulateDependencies(targetFile: string): boolean {
    return virtualDependencies.verify(targetFile);
  }
}
export const dependencySimulator = new DependencySimulator();
