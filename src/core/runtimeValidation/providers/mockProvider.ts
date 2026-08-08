import { IRuntimeValidationProvider, RuntimeValidationContext, RuntimeValidationResult } from '../runtimeTypes';

export class MockProvider implements IRuntimeValidationProvider {
  public readonly id = 'mock-runtime-provider';
  public readonly name = 'Mock Runtime Subsystem';
  public readonly targetSubsystem = 'Memory';

  public async validate(context: RuntimeValidationContext): Promise<RuntimeValidationResult> {
    return {
      name: this.name,
      status: 'Passed',
      score: 100,
      details: 'Mock runtime parameters validated.',
      errors: [],
      warnings: [],
      metrics: {
        mockPassed: 1
      }
    };
  }
}

export const mockProvider = new MockProvider();
export default mockProvider;
