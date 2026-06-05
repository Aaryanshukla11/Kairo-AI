import { sessionBuilder } from './builder';
import { IDevelopmentRequest } from '../planning-validator-handoff/types';
import { IGeneratorSession } from './types';

export class GeneratorSessionBuilder {
  public buildSession(request: IDevelopmentRequest): IGeneratorSession {
    const session = sessionBuilder.build(request);
    return this.deepFreeze(session);
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

export const generatorSessionBuilder = new GeneratorSessionBuilder();
export default generatorSessionBuilder;
export * from './types';
export { CodingInstructionsManager } from './instructions';
