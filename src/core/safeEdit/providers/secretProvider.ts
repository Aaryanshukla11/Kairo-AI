import { SafetyProvider } from './baseSafetyProvider';
import { SafeEditInput } from '../safeEditTypes';

export class SecretProvider implements SafetyProvider {
  public name = 'SecretSafetyProvider';
  public analyze(input: SafeEditInput): string[] {
    const issues: string[] = [];
    if (input.patchContent.includes('password') || input.patchContent.includes('secret') || input.patchContent.includes('apiKey')) {
      issues.push('Contains credential key terms.');
    }
    return issues;
  }
  public validate(input: SafeEditInput): boolean {
    return true;
  }
  public risk(input: SafeEditInput): number {
    return this.analyze(input).length ? 60 : 10;
  }
  public recommendations(input: SafeEditInput): string[] {
    return this.analyze(input).length ? ['Ensure secrets are stored in environment variables, not plain text.'] : [];
  }
}
export const secretProvider = new SecretProvider();
