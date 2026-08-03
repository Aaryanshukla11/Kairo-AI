import { TrainingHyperparameters } from '../configurationTypes';

export class PretrainingProvider {
  public getTemplate(): TrainingHyperparameters {
    return {
      optimizer: 'AdamW',
      scheduler: 'cosine',
      precision: 'bf16',
      batchSize: 32,
      gradientAccumulation: 4,
      learningRate: 6e-4,
      warmupRatio: 0.01,
      epochs: 5,
      randomSeed: 42,
      gradientClipping: 1.0,
      mixedPrecision: true
    };
  }
}

export const pretrainingProvider = new PretrainingProvider();
export default pretrainingProvider;
