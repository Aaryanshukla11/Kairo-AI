import { TrainingHyperparameters } from '../configurationTypes';

export class InstructionTuningProvider {
  public getTemplate(): TrainingHyperparameters {
    return {
      optimizer: 'AdamW',
      scheduler: 'cosine',
      precision: 'bf16',
      batchSize: 16,
      gradientAccumulation: 2,
      learningRate: 5e-5,
      warmupRatio: 0.03,
      epochs: 3,
      randomSeed: 42,
      gradientClipping: 1.0,
      mixedPrecision: true
    };
  }
}

export const instructionTuningProvider = new InstructionTuningProvider();
export default instructionTuningProvider;
