import { OptimizerStateModel } from '../optimizerTypes';

export class LionProvider {
  public step(state: OptimizerStateModel): void {
    state.stepCount++;
    state.momentum = 0.9;
    state.movingAverageSq = 0.0;
  }
}

export const lionProvider = new LionProvider();
export default lionProvider;
