import { TrainingHyperparameters } from '../configurationTypes';

export class EvaluationProvider {
  public getTemplate(): TrainingHyperparameters {
    return {
      optimizer: 'SGD', // Not trained, placeholder
      scheduler: 'constant',
      precision: 'fp32',
      batchSize: 1,
      gradientAccumulation: 1,
      learningRate: 0.0,
      warmupRatio: 0.0,
      epochs: 1,
      randomSeed: 42,
      gradientClipping: 0.0,
      mixedPrecision: false
    };
  }
}

export const evaluationProvider = new EvaluationProvider();
export default evaluationProvider;
