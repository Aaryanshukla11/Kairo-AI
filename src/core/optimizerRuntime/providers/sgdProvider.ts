import { OptimizerStateModel } from '../optimizerTypes';

export class SgdProvider {
  public step(state: OptimizerStateModel): void {
    state.stepCount++;
    state.momentum = 0.9;
    state.movingAverageSq = 0.0; // no moving averages of squared gradients in SGD
  }
}

export const sgdProvider = new SgdProvider();
export default sgdProvider;
