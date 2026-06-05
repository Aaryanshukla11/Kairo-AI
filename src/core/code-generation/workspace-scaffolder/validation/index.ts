import { IWorkspacePackage } from '../schema';

export class ScaffolderIntegrityValidator {
  public validate(packages: IWorkspacePackage[]): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    const names = new Set<string>();

    for (const p of packages) {
      // 1. Check duplicate packages names
      if (names.has(p.name)) {
        violations.push(`Workspace Integrity Violation: Duplicate package name detected: '${p.name}'.`);
      }
      names.add(p.name);

      // 2. Validate self-dependencies circular loops
      if (p.dependencies.includes(p.name)) {
        violations.push(`Workspace Integrity Violation: Package '${p.name}' contains a self-dependency loop.`);
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}

export const scaffolderIntegrityValidator = new ScaffolderIntegrityValidator();
export default scaffolderIntegrityValidator;
