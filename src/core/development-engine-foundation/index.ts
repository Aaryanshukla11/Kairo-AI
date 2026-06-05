import { developmentCoordinator } from './coordinator';
import { IDevelopmentRequest } from '../planning-validator-handoff/types';
import { IGenerationExecution, IGenerator } from './types';
import { generatorRegistry } from './registry';

export class DevelopmentEngine {
  public registerGenerator(generator: IGenerator): void {
    generatorRegistry.register(generator);
  }

  public prepare(request: IDevelopmentRequest): IGenerationExecution {
    const execution = developmentCoordinator.prepareExecution(request);
    return this.deepFreeze(execution);
  }

  public clearGenerators(): void {
    generatorRegistry.clear();
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

export const developmentEngine = new DevelopmentEngine();
export default developmentEngine;
export * from './types';
export { GeneratorRegistry } from './registry';
export { GeneratorScheduler } from './scheduler';
export { DevelopmentCoordinator } from './coordinator';
