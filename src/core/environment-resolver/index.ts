import { environmentDetector } from './detector';
import { IFilesystemAdapter } from '../workspace-engine/fs-adapter';
import { IExecutionProfile } from './types';

export class EnvironmentResolver {
  public async resolve(
    workspacePath: string,
    fsAdapter: IFilesystemAdapter
  ): Promise<IExecutionProfile> {
    const profile = await environmentDetector.resolveProfile(workspacePath, fsAdapter);
    return this.deepFreeze(profile);
  }

  private deepFreeze<T>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }
}

export const environmentResolver = new EnvironmentResolver();
export default environmentResolver;
export * from './types';
export { EnvironmentDetector } from './detector';
