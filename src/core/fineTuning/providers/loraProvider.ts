import { LoRAConfig, TrainableParametersReport } from '../fineTuningTypes';

export class LoRAProvider {
  public configureLoRA(config: LoRAConfig, modelParameters: number): TrainableParametersReport {
    // LoRA introduces low-rank matrices. Standard estimate:
    // Trainable parameters = targetModules.length * rank * hidden_dim * 2
    // Let's assume hidden_dim = 4096. Number of parameters estimated:
    const modulesCount = config.targetModules.length || 4;
    const rank = config.r || 8;
    const hiddenDim = 4096;
    const adapterParameters = modulesCount * rank * hiddenDim * 2;

    const totalParameters = modelParameters;
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

export const loraProvider = new LoRAProvider();
export default loraProvider;
