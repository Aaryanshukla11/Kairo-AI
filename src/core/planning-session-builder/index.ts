import { sessionBuilder } from './builder';
import { IAIRequestOutput } from '../ai-request-builder/types';
import { IPlanningSession } from './types';

export class PlanningSessionBuilder {
  public buildSession(request: IAIRequestOutput): IPlanningSession {
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

export const planningSessionBuilder = new PlanningSessionBuilder();
export default planningSessionBuilder;
export * from './types';
export { InstructionsManager } from './instructions';
