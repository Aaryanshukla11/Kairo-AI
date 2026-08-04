export class MockValidationProvider {
  public runValidation(_checkpointId: string, _datasetPath: string): {
    validationLoss: number;
    accuracy: number;
    perplexity: number;
    passRate: number;
    inferenceTimeMs: number;
    tokensPerSec: number;
    memoryUsageMB: number;
    benchmarkScore: number;
  } {
    // Generate static mock validation results for offline simulation
    return {
      validationLoss: 1.050,
      accuracy: 0.850,
      perplexity: 2.857,
      passRate: 0.980,
      inferenceTimeMs: 150.0,
      tokensPerSec: 1500.0,
      memoryUsageMB: 2900.0,
      benchmarkScore: 84.0
    };
  }
}

export const mockValidationProvider = new MockValidationProvider();
export default mockValidationProvider;
