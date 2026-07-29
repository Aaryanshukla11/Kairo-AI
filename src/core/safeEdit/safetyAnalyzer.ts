import { SafeEditInput } from './safeEditTypes';
import { workspaceSafety } from './strategies/workspaceSafety';
import { filesystemSafety } from './strategies/filesystemSafety';
import { dependencySafety } from './strategies/dependencySafety';
import { architectureSafety } from './strategies/architectureSafety';

export class SafetyAnalyzer {
  public analyze(input: SafeEditInput): { blockingIssues: string[]; warnings: string[] } {
    const blockingIssues: string[] = [];
    const warnings: string[] = [];

    const strategies = [
      workspaceSafety,
      filesystemSafety,
      dependencySafety,
      architectureSafety
    ];

    for (const strategy of strategies) {
      try {
        const res = strategy.check(input);
        blockingIssues.push(...res.blocking);
        warnings.push(...res.warnings);
      } catch (err: any) {
        blockingIssues.push(`STRATEGY-ERR: Strategy ${strategy.name} failed: ${err.message}`);
      }
    }

    return { blockingIssues, warnings };
  }
}

export const safetyAnalyzer = new SafetyAnalyzer();
