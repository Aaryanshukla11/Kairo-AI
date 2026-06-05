import { IPlannedFile, IExecutionStep } from '../schema';

export class ManifestValidator {
  public validate(
    files: IPlannedFile[],
    steps: IExecutionStep[]
  ): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    const filePaths = new Set<string>();

    for (const f of files) {
      if (filePaths.has(f.path)) {
        violations.push(`Manifest Validation Error: Duplicate file path mapping registered: '${f.path}'`);
      }
      filePaths.add(f.path);
    }

    const generatorIds = new Set(steps.map(s => s.generatorId));
    for (const f of files) {
      if (f.ownerGeneratorId !== 'ConfigGenerator' && f.ownerGeneratorId !== 'TypesGenerator' && !generatorIds.has(f.ownerGeneratorId)) {
        violations.push(`Manifest Validation Error: File '${f.path}' is owned by '${f.ownerGeneratorId}', which is not registered in the execution steps plan.`);
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}

export const manifestValidator = new ManifestValidator();
export default manifestValidator;
