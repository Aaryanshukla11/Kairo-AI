import { OptimizerStateModel } from '../optimizerTypes';

export class AdamwProvider {
  public step(state: OptimizerStateModel): void {
    state.stepCount++;
    // Simulate decoupled weight decay
    state.momentum = 0.9;
    state.movingAverageSq = 0.999;
  }
}

export const adamwProvider = new AdamwProvider();
export default adamwProvider;
