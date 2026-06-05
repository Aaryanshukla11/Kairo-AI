import { IReleaseValidationProvider } from '../releaseTypes';
import { releaseChecklist } from '../rcBuilder/releaseChecklist';

export class ReleaseProvider implements IReleaseValidationProvider {
  public readonly id = 'release-provider';
  public readonly name = 'Quality Gate Auditor';
  public readonly targetSubsystem = 'Release';

  public async validate(version: string): Promise<{
    score: number;
    passed: boolean;
    issues: string[];
  }> {
    const gates = releaseChecklist.evaluateGate();
    const allPassed = Object.values(gates).every(Boolean);
    return {
      score: allPassed ? 100 : 50,
      passed: allPassed,
      issues: allPassed ? [] : ['Some Quality Gate validation failed.']
    };
  }
}

export const releaseProvider = new ReleaseProvider();
export default releaseProvider;
