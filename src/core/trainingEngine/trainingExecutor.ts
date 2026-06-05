import { pytorchProvider, jaxProvider, tensorflowProvider, mockTrainingProvider } from './providers';

export class TrainingExecutor {
  public executeBatchStep(
    batchId: number,
    framework: 'pytorch' | 'jax' | 'tensorflow' | string
  ): { loss: number; gpuUsage: number; vram: number } {
    if (framework === 'pytorch') {
      return pytorchProvider.executeForwardBackwardStep(batchId);
    }
    if (framework === 'jax') {
      return jaxProvider.executeJittedStep(batchId);
    }
    if (framework === 'tensorflow') {
      return tensorflowProvider.executeGraphStep(batchId);
    }

    return mockTrainingProvider.executeMockStep(batchId);
  }
}

export const trainingExecutor = new TrainingExecutor();
export default trainingExecutor;
