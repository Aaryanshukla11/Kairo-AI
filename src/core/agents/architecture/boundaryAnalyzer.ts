import { ArchViolation, ArchViolationType } from './architectureTypes';

export class BoundaryAnalyzer {
  public checkBoundaries(filesContent: { [filePath: string]: string }): ArchViolation[] {
    const violations: ArchViolation[] = [];

    for (const [filePath, content] of Object.entries(filesContent)) {
      // Check feature coupling: import statements referencing other domains directly
      const imports = content.match(/import\s+.*\s+from\s+['"](.*)['"]/g) || [];
      
      if (filePath.includes('src/webview/components/chat/') && content.includes('import') && content.includes('/agents/security/')) {
        violations.push({
          type: ArchViolationType.FeatureCoupling,
          file: filePath,
          description: 'High Coupling: Chat layout imports Security Center components directly. Decouple using registry loaders.',
          severity: 'Low'
        });
      }
    }

    return violations;
  }
}

export const boundaryAnalyzer = new BoundaryAnalyzer();
