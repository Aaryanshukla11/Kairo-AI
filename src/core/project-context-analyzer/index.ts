import { projectContextAnalyzer } from './analyzer';
import { IProjectContextOutput } from './types';

export class ProjectContextFacade {
  public analyzeWorkspace(rootDir: string): IProjectContextOutput {
    const result = projectContextAnalyzer.analyze(rootDir);
    return this.deepFreeze(result);
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

export const projectContextFacade = new ProjectContextFacade();
export default projectContextFacade;
export * from './types';
export { ProjectContextAnalyzer } from './analyzer';
