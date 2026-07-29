import { SafeEditInput } from '../safeEditTypes';

export class ArchitectureSafety {
  public name = 'ArchitectureSafetyStrategy';

  public check(input: SafeEditInput): { blocking: string[]; warnings: string[] } {
    const blocking: string[] = [];
    const warnings: string[] = [];

    // If architecture report has layer violations of High severity, block it
    if (input.architectureReport) {
      const highViolations = [
        ...input.architectureReport.layerViolations,
        ...input.architectureReport.boundaryViolations
      ].filter(v => v.severity === 'High');

      if (highViolations.length > 0) {
        blocking.push(`ARCH-01: High-severity architecture violations: ${highViolations.map(v => v.description).join('; ')}`);
      }

      const mediumViolations = [
        ...input.architectureReport.layerViolations,
        ...input.architectureReport.boundaryViolations
      ].filter(v => v.severity === 'Medium');

      if (mediumViolations.length > 0) {
        warnings.push(`ARCH-02: Medium-severity architecture violations: ${mediumViolations.map(v => v.description).join('; ')}`);
      }
    }

    // Inspect patch content imports to check for standard layering violation
    // E.g., backend importing webview, or core importing extension
    const content = input.patchContent;
    if (content.includes('import') && content.includes('/webview/') && !input.targetFile.includes('/webview/')) {
      blocking.push('ARCH-03: Layer boundary violation - non-webview file importing webview resources');
    }

    return { blocking, warnings };
  }
}

export const architectureSafety = new ArchitectureSafety();
