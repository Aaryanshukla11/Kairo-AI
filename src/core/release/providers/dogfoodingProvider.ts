import { IReleaseValidationProvider } from '../releaseTypes';
import { dogfoodingEngine } from '../dogfooding/dogfoodingEngine';
import * as path from 'path';

export class DogfoodingProvider implements IReleaseValidationProvider {
  public readonly id = 'dogfooding-provider';
  public readonly name = 'Dogfooding Subsystem Validator';
  public readonly targetSubsystem = 'Dogfooding';

  public async validate(version: string): Promise<{
    score: number;
    passed: boolean;
    issues: string[];
  }> {
    const baseDir = path.resolve(__dirname, '../../../../');
    const result = await dogfoodingEngine.executeDogfooding(
      'Verify event propagation retry intervals boundaries in dead letter queue',
      baseDir
    );

    return {
      score: result.validationIssues.length === 0 ? 100 : 70,
      passed: result.safeEditPassed && result.patchProduced,
      issues: result.validationIssues
    };
  }
}

export const dogfoodingProvider = new DogfoodingProvider();
export default dogfoodingProvider;
