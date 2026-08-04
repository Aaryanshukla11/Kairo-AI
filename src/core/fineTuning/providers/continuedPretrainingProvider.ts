import { TrainableParametersReport } from '../fineTuningTypes';

export class ContinuedPretrainingProvider {
  public configureContinuedPretraining(modelParameters: number): TrainableParametersReport {
    // Continued pretraining trains all parameters on raw corpus data
    return {
      totalParameters: modelParameters,
      trainableParameters: modelParameters,
      percentageTrainable: 100,
      frozenParameters: 0,
      adapterParameters: 0
    };
  }
}

export const continuedPretrainingProvider = new ContinuedPretrainingProvider();
export default continuedPretrainingProvider;
