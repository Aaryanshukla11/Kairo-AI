import { SafetyProvider } from './baseSafetyProvider';
import { SafeEditInput } from '../safeEditTypes';

export class TerminalProvider implements SafetyProvider {
  public name = 'TerminalSafetyProvider';
  public analyze(input: SafeEditInput): string[] {
    const issues: string[] = [];
    if (input.patchContent.includes('child_process.exec') || input.patchContent.includes('spawn(')) {
      issues.push('Contains subprocess spawn operations.');
    }
    return issues;
  }
  public validate(input: SafeEditInput): boolean {
    return true;
  }
  public risk(input: SafeEditInput): number {
    return this.analyze(input).length ? 50 : 10;
  }
  public recommendations(input: SafeEditInput): string[] {
    return this.analyze(input).length ? ['Review shell commands injection risk.'] : [];
  }
}
export const terminalProvider = new TerminalProvider();
