import { OptimizerStateModel } from '../optimizerTypes';

export class MockOptimizerProvider {
  public generateMockState(type: string): OptimizerStateModel {
    return {
      optimizerType: 'AdamW',
      stepCount: 1,
      learningRate: 0.001,
      weightDecay: 0.01,
      momentum: 0.9,
      movingAverageSq: 0.999,
      gradientStats: {
        norm: 0.354,
        mean: 0.002,
        variance: 0.0007
      }
    };
  }
}

export const mockOptimizerProvider = new MockOptimizerProvider();
export default mockOptimizerProvider;
