import { TrainableParametersReport } from '../fineTuningTypes';

export class MockFineTuningProvider {
  public configureMock(modelParameters: number): TrainableParametersReport {
    // 5% trainable for mock parameter adapters
    const trainable = Math.floor(modelParameters * 0.05);
    return {
      totalParameters: modelParameters,
      trainableParameters: trainable,
      percentageTrainable: 5,
      frozenParameters: modelParameters - trainable,
      adapterParameters: trainable
    };
  }
}

export const mockFineTuningProvider = new MockFineTuningProvider();
export default mockFineTuningProvider;
