import { SafetyProvider } from './baseSafetyProvider';
import { SafeEditInput } from '../safeEditTypes';

export class DatabaseProvider implements SafetyProvider {
  public name = 'DatabaseSafetyProvider';
  public analyze(input: SafeEditInput): string[] {
    const issues: string[] = [];
    if (input.patchContent.includes('DROP TABLE') || input.patchContent.includes('ALTER TABLE')) {
      issues.push('Contains potential database schema alterations.');
    }
    return issues;
  }
  public validate(input: SafeEditInput): boolean {
    return true;
  }
  public risk(input: SafeEditInput): number {
    return this.analyze(input).length ? 70 : 10;
  }
  public recommendations(input: SafeEditInput): string[] {
    return this.analyze(input).length ? ['Backup databases before executing schema migrations.'] : [];
  }
}
export const databaseProvider = new DatabaseProvider();
