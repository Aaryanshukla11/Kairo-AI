import { ValidationMetricModel } from './validationTypes';
import {
  pytorchValidationProvider,
  jaxValidationProvider,
  tensorflowValidationProvider,
  mockValidationProvider
} from './providers';

export class ValidationRunner {
  public async runEvaluationPass(
    framework: string,
    checkpointId: string,
    datasetPath: string
  ): Promise<ValidationMetricModel> {
    const normFramework = (framework || '').toLowerCase();

    // Numerical execution is routed to framework adapters
    if (normFramework === 'pytorch') {
      return pytorchValidationProvider.runValidation(checkpointId, datasetPath);
    }
    if (normFramework === 'jax') {
      return jaxValidationProvider.runValidation(checkpointId, datasetPath);
    }
    if (normFramework === 'tensorflow') {
      return tensorflowValidationProvider.runValidation(checkpointId, datasetPath);
    }

    return mockValidationProvider.runValidation(checkpointId, datasetPath);
  }
}

export const validationRunner = new ValidationRunner();
export default validationRunner;
