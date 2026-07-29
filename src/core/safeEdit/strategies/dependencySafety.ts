import { SafeEditInput } from '../safeEditTypes';

export class DependencySafety {
  public name = 'DependencySafetyStrategy';

  public check(input: SafeEditInput): { blocking: string[]; warnings: string[] } {
    const blocking: string[] = [];
    const warnings: string[] = [];
    const content = input.patchContent;

    // Check direct dependencies modification attempts in package.json
    if (input.targetFile.endsWith('package.json')) {
      if (content.includes('"dependencies"') || content.includes('"devDependencies"')) {
        blocking.push('DEP-01: Direct modification of dependencies in package.json is prohibited');
      }
    }

    // Manifest dependencies checks
    if (input.patchManifest && input.patchManifest.dependenciesChanged && input.patchManifest.dependenciesChanged.length > 0) {
      blocking.push(`DEP-02: Manifest attempts to modify dependencies: ${input.patchManifest.dependenciesChanged.join(', ')}`);
    }

    return { blocking, warnings };
  }
}

export const dependencySafety = new DependencySafety();
