import { TrainableParametersReport } from '../fineTuningTypes';

export class InstructionTuningProvider {
  public configureInstructionTuning(modelParameters: number): TrainableParametersReport {
    // Instruction tuning is usually full fine-tune on instructions dataset
    return {
      totalParameters: modelParameters,
      trainableParameters: modelParameters,
      percentageTrainable: 100,
      frozenParameters: 0,
      adapterParameters: 0
    };
  }
}

export const instructionTuningProvider = new InstructionTuningProvider();
export default instructionTuningProvider;
