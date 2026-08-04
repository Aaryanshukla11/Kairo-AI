import { OptimizerStateModel } from '../optimizerTypes';

export class AdamProvider {
  public step(state: OptimizerStateModel): void {
    state.stepCount++;
    // Simulate Adam tracking moving averages
    state.momentum = 0.9;
    state.movingAverageSq = 0.999;
  }
}

export const adamProvider = new AdamProvider();
export default adamProvider;
