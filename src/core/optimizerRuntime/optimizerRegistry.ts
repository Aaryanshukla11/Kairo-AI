import { OptimizerStateModel } from './optimizerTypes';

export class OptimizerRegistry {
  private states = new Map<string, OptimizerStateModel>();

  public registerState(sessionId: string, state: OptimizerStateModel): void {
    this.states.set(sessionId, { ...state });
  }

  public getState(sessionId: string): OptimizerStateModel | undefined {
    return this.states.get(sessionId);
  }

  public clear(): void {
    this.states.clear();
  }
}

export const optimizerRegistry = new OptimizerRegistry();
export default optimizerRegistry;
