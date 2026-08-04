import { QLoRAConfig, TrainableParametersReport } from '../fineTuningTypes';

export class QLoRAProvider {
  public configureQLoRA(config: QLoRAConfig, modelParameters: number): TrainableParametersReport {
    const modulesCount = config.targetModules.length || 4;
    const rank = config.r || 8;
    const hiddenDim = 4096;
    const adapterParameters = modulesCount * rank * hiddenDim * 2;

    const totalParameters = modelParameters;
    // QLoRA freezes base weights in 4-bit precision, only training adapter parameters
    const trainableParameters = adapterParameters;
    const percentageTrainable = parseFloat(((trainableParameters / totalParameters) * 100).toFixed(4));

    return {
      totalParameters,
      trainableParameters,
      percentageTrainable,
      frozenParameters: totalParameters - trainableParameters,
      adapterParameters
    };
  }
}

export const qloraProvider = new QLoRAProvider();
export default qloraProvider;
