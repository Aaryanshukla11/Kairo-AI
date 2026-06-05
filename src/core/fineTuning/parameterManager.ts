import { TrainableParametersReport } from './fineTuningTypes';

export class ParameterManager {
  public compileReport(
    totalParameters: number,
    trainableParameters: number,
    adapterParameters: number = 0
  ): TrainableParametersReport {
    const percentageTrainable = totalParameters > 0 
      ? parseFloat(((trainableParameters / totalParameters) * 100).toFixed(4))
      : 0;

    return {
      totalParameters,
      trainableParameters,
      percentageTrainable,
      frozenParameters: totalParameters - trainableParameters,
      adapterParameters
    };
  }
}

export const parameterManager = new ParameterManager();
export default parameterManager;
