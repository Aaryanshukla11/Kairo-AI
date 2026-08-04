import { dependencyGraph } from './dependencyGraph';
import { IValidationProvider, ValidationContext, ValidationResult } from './validationTypes';

export class DependencyAuditor implements IValidationProvider {
  public readonly id = 'dependency-auditor';
  public readonly name = 'Dependency Graph Auditor';
  public readonly targetSubsystem = 'Dependency Graph';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const graphData = dependencyGraph.generate();
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // Evaluate scores
    let score = 100;

    if (graphData.circularPaths.length > 0) {
      score -= Math.min(30, graphData.circularPaths.length * 10);
      errors.push(`Detected ${graphData.circularPaths.length} circular dependencies!`);
      for (const path of graphData.circularPaths) {
        errors.push(`Cycle: ${path.join(' -> ')}`);
      }
    }

    if (graphData.duplicateProviders.length > 0) {
      score -= Math.min(20, graphData.duplicateProviders.length * 5);
      errors.push(`Detected ${graphData.duplicateProviders.length} duplicate provider definitions.`);
      errors.push(...graphData.duplicateProviders);
    }

    if (graphData.orphanModules.length > 0) {
      score -= Math.min(10, graphData.orphanModules.length * 2);
      warnings.push(`Detected ${graphData.orphanModules.length} orphan modules (no imports and no dependents).`);
      warnings.push(...graphData.orphanModules.slice(0, 5).map(m => `Orphan: ${m}`));
    }

    if (graphData.unusedModules.length > 0) {
      score -= Math.min(10, graphData.unusedModules.length * 1);
      warnings.push(`Detected ${graphData.unusedModules.length} unused modules (not imported by any other module).`);
      warnings.push(...graphData.unusedModules.slice(0, 5).map(m => `Unused: ${m}`));
    }

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Analyzed ${graphData.nodes.length} workspace modules. Found ${graphData.circularPaths.length} cycles, ${graphData.unusedModules.length} unused, and ${graphData.duplicateProviders.length} duplicate providers.`,
      errors,
      warnings,
      metrics: {
        totalModules: graphData.nodes.length,
        circularPathsCount: graphData.circularPaths.length,
        unusedModulesCount: graphData.unusedModules.length,
        duplicateProvidersCount: graphData.duplicateProviders.length,
        orphanModulesCount: graphData.orphanModules.length
      }
    };
  }
}

export const dependencyAuditor = new DependencyAuditor();
