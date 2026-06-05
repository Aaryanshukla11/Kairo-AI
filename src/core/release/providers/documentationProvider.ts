import { IReleaseValidationProvider } from '../releaseTypes';
import { documentationValidator } from '../documentation/documentationValidator';
import * as path from 'path';

export class DocumentationProvider implements IReleaseValidationProvider {
  public readonly id = 'documentation-provider';
  public readonly name = 'Documentation Guide Validator';
  public readonly targetSubsystem = 'Documentation';

  public async validate(version: string): Promise<{
    score: number;
    passed: boolean;
    issues: string[];
  }> {
    const baseDir = path.resolve(__dirname, '../../../../');
    const res = documentationValidator.validateDocs(baseDir);
    return {
      score: res.score,
      passed: res.passed,
      issues: [...res.brokenLinks, ...res.missingSections]
    };
  }
}

export const documentationProvider = new DocumentationProvider();
export default documentationProvider;
