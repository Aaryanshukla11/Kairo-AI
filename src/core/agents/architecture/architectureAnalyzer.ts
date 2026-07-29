import { ArchViolation, ArchViolationType } from './architectureTypes';

export class ArchitectureAnalyzer {
  public auditFileImports(filePath: string, content: string): ArchViolation[] {
    const violations: ArchViolation[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('import ') && line.includes('/webview/') && filePath.includes('src/core/')) {
        violations.push({
          type: ArchViolationType.DependencyInversion,
          file: filePath,
          description: `Layer inversion violation: Core module imports webview elements directly at line ${i + 1}.`,
          severity: 'High'
        });
      }
    }

    return violations;
  }
}

export const architectureAnalyzer = new ArchitectureAnalyzer();
