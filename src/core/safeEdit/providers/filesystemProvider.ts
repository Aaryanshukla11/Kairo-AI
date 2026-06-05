import { SafetyProvider } from './baseSafetyProvider';
import { SafeEditInput } from '../safeEditTypes';

export class FilesystemProvider implements SafetyProvider {
  public name = 'FilesystemSafetyProvider';
  public analyze(input: SafeEditInput): string[] {
    const issues: string[] = [];
    if (input.patchContent.includes('rm -rf') || input.patchContent.includes('fs.unlink')) {
      issues.push('Contains unsafe file deletion commands.');
    }
    return issues;
  }
  public validate(input: SafeEditInput): boolean {
    return !this.analyze(input).length;
  }
  public risk(input: SafeEditInput): number {
    return this.analyze(input).length ? 90 : 10;
  }
  public recommendations(input: SafeEditInput): string[] {
    return this.analyze(input).length ? ['Avoid using raw rm -rf or unlink operations.'] : [];
  }
}
export const filesystemProvider = new FilesystemProvider();
