import { OptimizerStateModel } from './optimizerTypes';
import { optimizerRegistry } from './optimizerRegistry';

export class OptimizerStateManager {
  public loadState(sessionId: string): OptimizerStateModel | undefined {
    return optimizerRegistry.getState(sessionId);
  }

  public storeState(sessionId: string, state: OptimizerStateModel): void {
    optimizerRegistry.registerState(sessionId, state);
  }
}

export const optimizerStateManager = new OptimizerStateManager();
export default optimizerStateManager;
