import { builder } from './builder';
import { IPromptContext } from '../prompt-context-builder/types';
import { IAIRequestOutput } from './types';

export class AIRequestBuilder {
  public buildRequest(context: IPromptContext): IAIRequestOutput {
    const request = builder.compile(context);
    return this.deepFreeze(request);
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

export const aiRequestBuilder = new AIRequestBuilder();
export default aiRequestBuilder;
export * from './types';
export { PrioritySystem } from './priority';
export { TokenOptimizer } from './optimizer';
