import { TrainingHyperparameters } from '../configurationTypes';

export class CustomTrainingProvider {
  public getTemplate(): TrainingHyperparameters {
    return {
      optimizer: 'Adafactor',
      scheduler: 'linear',
      precision: 'bf16',
      batchSize: 4,
      gradientAccumulation: 8,
      learningRate: 1e-3,
      warmupRatio: 0.05,
      epochs: 10,
      randomSeed: 1337,
      gradientClipping: 0.5,
      mixedPrecision: true
    };
  }
}

export const customTrainingProvider = new CustomTrainingProvider();
export default customTrainingProvider;
