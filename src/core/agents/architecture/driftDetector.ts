import { ArchViolation, ArchViolationType } from './architectureTypes';

export class DriftDetector {
  public detectDrift(
    activeFolders: string[],
    prescribedFolders: string[]
  ): ArchViolation[] {
    const violations: ArchViolation[] = [];
    const prescribed = new Set(prescribedFolders);

    for (const folder of activeFolders) {
      if (!prescribed.has(folder)) {
        violations.push({
          type: ArchViolationType.ArchDrift,
          file: folder,
          description: `Architecture Drift: Unsanctioned folder boundary "${folder}" found in active directory tree.`,
          severity: 'Medium'
        });
      }
    }

    return violations;
  }
}

export const driftDetector = new DriftDetector();
