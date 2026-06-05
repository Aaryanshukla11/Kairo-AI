import { abbreviationEngine } from './abbreviationEngine';
import { namingValidator } from './namingValidator';
import { collisionDetector } from './collisionDetector';
import { namingRegistry } from './namingRegistry';
import { NamingReport } from './namingTypes';

export class NamingGenerator {
  public generateCandidates(
    baseTerm: string,
    symbolType: string,
    casing: 'camelCase' | 'snakeCase' | 'PascalCase',
    existingFiles: string[]
  ): NamingReport {
    const expanded = abbreviationEngine.expand(baseTerm);

    let candidate = this.formatCasing(expanded, casing);

    for (const provider of namingRegistry.getProviders()) {
      if (provider.isReserved(candidate)) {
        candidate = candidate + 'Symbol';
      }
    }

    namingValidator.validateName(candidate, symbolType);

    const hasCollision = collisionDetector.checkCollision(candidate, existingFiles);

    const alternativeNames: string[] = [
      this.formatCasing(expanded + 'Helper', casing),
      this.formatCasing(expanded + 'Manager', casing)
    ];

    const report: NamingReport = {
      symbolName: candidate,
      alternativeNames,
      confidenceScore: hasCollision ? 0.6 : 0.95,
      conventionMatch: true,
      collisionStatus: hasCollision ? 'warning' : 'none',
      namespace: symbolType
    };

    return report;
  }

  private formatCasing(word: string, casing: 'camelCase' | 'snakeCase' | 'PascalCase'): string {
    const w = word.replace(/[^a-zA-Z0-9]/g, '');
    if (casing === 'snakeCase') {
      return w.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    }
    const cap = w.charAt(0).toUpperCase() + w.slice(1);
    if (casing === 'PascalCase') {
      return cap;
    }
    return cap.charAt(0).toLowerCase() + cap.slice(1);
  }
}

export const namingGenerator = new NamingGenerator();
