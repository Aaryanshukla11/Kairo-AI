import { SafeEditInput } from '../safeEditTypes';

export class WorkspaceSafety {
  public name = 'WorkspaceSafetyStrategy';

  public check(input: SafeEditInput): { blocking: string[]; warnings: string[] } {
    const blocking: string[] = [];
    const warnings: string[] = [];

    // If target file is not under a valid workspace directory, raise warning
    if (input.targetFile && (input.targetFile.includes('..') || input.targetFile.includes('temp') || input.targetFile.includes('tmp'))) {
      warnings.push('WORKSPACE-01: Target file path is outside standard workspace directories');
    }

    return { blocking, warnings };
  }
}

export const workspaceSafety = new WorkspaceSafety();
