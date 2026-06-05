import { TrainingHyperparameters } from '../configurationTypes';

export class FinetuningProvider {
  public getTemplate(): TrainingHyperparameters {
    return {
      optimizer: 'AdamW',
      scheduler: 'linear',
      precision: 'fp16',
      batchSize: 8,
      gradientAccumulation: 2,
      learningRate: 2e-5,
      warmupRatio: 0.1,
      epochs: 3,
      randomSeed: 42,
      gradientClipping: 1.0,
      mixedPrecision: true
    };
  }
}

export const finetuningProvider = new FinetuningProvider();
export default finetuningProvider;
