import { IValidationProvider, ValidationContext, ValidationResult } from '../validationTypes';

export class MockProvider implements IValidationProvider {
  public readonly id = 'mock-provider';
  public readonly name = 'Mock Subsystem Provider';
  public readonly targetSubsystem = 'Memory';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    return {
      name: this.name,
      status: 'Passed',
      score: 100,
      details: 'Mock subsystem integration is fully verified.',
      errors: [],
      warnings: [],
      metrics: {
        mockCheckPassed: 1
      }
    };
  }
}

export const mockProvider = new MockProvider();
export default mockProvider;
