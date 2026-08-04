import { TrainableParametersReport } from '../fineTuningTypes';

export class FullFineTuneProvider {
  public configureFull(modelParameters: number): TrainableParametersReport {
    const totalParameters = modelParameters;
    // Full fine-tuning trains all parameters
    return {
      totalParameters,
      trainableParameters: totalParameters,
      percentageTrainable: 100,
      frozenParameters: 0,
      adapterParameters: 0
    };
  }
}

export const fullFineTuneProvider = new FullFineTuneProvider();
export default fullFineTuneProvider;
