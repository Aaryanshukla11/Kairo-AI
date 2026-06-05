import { IReleaseValidationProvider } from '../releaseTypes';

export class MockProvider implements IReleaseValidationProvider {
  public readonly id = 'mock-release-provider';
  public readonly name = 'Mock Release Validator';
  public readonly targetSubsystem = 'Developer Experience';

  public async validate(version: string): Promise<{
    score: number;
    passed: boolean;
    issues: string[];
  }> {
    return {
      score: 100,
      passed: true,
      issues: []
    };
  }
}

export const mockProvider = new MockProvider();
export default mockProvider;
