import { dependencyGraph } from './dependencyGraph';
import { IValidationProvider, ValidationContext, ValidationResult, ModuleBoundaryReport } from './validationTypes';

export class ModuleBoundaryValidator implements IValidationProvider {
  public readonly id = 'module-boundary-validator';
  public readonly name = 'Module Boundary Validator';
  public readonly targetSubsystem = 'Module Boundaries';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const graphData = dependencyGraph.generate();
    
    const violations: string[] = [];
    const layerLeaks: string[] = [];
    const featureCouplingIssues: string[] = [];
    const runtimeCyclesDetected: string[] = [];
    const duplicateServices: string[] = [];

    // Let's implement boundary rules:
    // Rule 1: common must NOT import from core, extension, or webview.
    // Rule 2: core must NOT import from extension or webview.
    // Rule 3: webview must NOT import from core or extension directly.
    for (const node of graphData.nodes) {
      const srcLayer = this.getRootLayer(node.id);
      
      for (const imp of node.imports) {
        const destLayer = this.getRootLayer(imp);

        if (srcLayer === 'common') {
          if (destLayer === 'core' || destLayer === 'extension' || destLayer === 'webview') {
            layerLeaks.push(`Layer Leak: '${node.id}' (common) imports from '${imp}' (${destLayer})`);
          }
        }

        if (srcLayer === 'core') {
          if (destLayer === 'extension' || destLayer === 'webview') {
            layerLeaks.push(`Layer Leak: '${node.id}' (core) imports from '${imp}' (${destLayer})`);
          }
        }

        if (srcLayer === 'webview') {
          if (destLayer === 'core' || destLayer === 'extension') {
            layerLeaks.push(`Layer Leak: '${node.id}' (webview) imports from '${imp}' (${destLayer})`);
          }
        }

        // Rule 4: Deep feature coupling: subsystems inside core shouldn't import from other core subsystems
        // if they are meant to be loosely coupled. Let's flag warning if core modules have high cross-subsystem coupling.
        const srcSubsystem = this.getSubsystem(node.id);
        const destSubsystem = this.getSubsystem(imp);
        if (srcSubsystem && destSubsystem && srcSubsystem !== destSubsystem) {
          // Some coupling is expected, but check if there are circular features
          const isCoupled = graphData.circularPaths.some(path => 
            path.includes(node.id) && path.includes(imp)
          );
          if (isCoupled) {
            featureCouplingIssues.push(`Feature Coupling: Subsystem '${srcSubsystem}' and '${destSubsystem}' are circularly coupled via '${node.id}' -> '${imp}'`);
          }
        }
      }
    }

    if (graphData.circularPaths.length > 0) {
      for (const path of graphData.circularPaths) {
        runtimeCyclesDetected.push(`Cycle: ${path.join(' -> ')}`);
      }
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    let score = 100;
    if (layerLeaks.length > 0) {
      score -= Math.min(40, layerLeaks.length * 10);
      errors.push(...layerLeaks);
    }
    if (featureCouplingIssues.length > 0) {
      score -= Math.min(20, featureCouplingIssues.length * 5);
      warnings.push(...featureCouplingIssues);
    }
    if (runtimeCyclesDetected.length > 0) {
      score -= Math.min(20, runtimeCyclesDetected.length * 5);
      errors.push(...runtimeCyclesDetected);
    }

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Validated module boundaries. Detected ${layerLeaks.length} layer leaks, ${featureCouplingIssues.length} coupling issues, and ${runtimeCyclesDetected.length} cycles.`,
      errors,
      warnings,
      metrics: {
        layerLeaksCount: layerLeaks.length,
        featureCouplingIssuesCount: featureCouplingIssues.length,
        runtimeCyclesDetectedCount: runtimeCyclesDetected.length,
        duplicateServicesCount: duplicateServices.length
      }
    };
  }

  public getBoundaryReport(): ModuleBoundaryReport {
    // Generate static boundary report for reports
    const graphData = dependencyGraph.generate();
    const violations: string[] = [];
    const layerLeaks: string[] = [];
    const featureCouplingIssues: string[] = [];
    const runtimeCyclesDetected: string[] = [];
    const duplicateServices: string[] = [];

    for (const node of graphData.nodes) {
      const srcLayer = this.getRootLayer(node.id);
      for (const imp of node.imports) {
        const destLayer = this.getRootLayer(imp);
        if (srcLayer === 'common' && (destLayer === 'core' || destLayer === 'extension' || destLayer === 'webview')) {
          layerLeaks.push(`Leak: ${node.id} -> ${imp}`);
        }
        if (srcLayer === 'core' && (destLayer === 'extension' || destLayer === 'webview')) {
          layerLeaks.push(`Leak: ${node.id} -> ${imp}`);
        }
      }
    }

    if (graphData.circularPaths.length > 0) {
      for (const path of graphData.circularPaths) {
        runtimeCyclesDetected.push(path.join(' -> '));
      }
    }

    return {
      violations,
      layerLeaks,
      featureCouplingIssues,
      runtimeCyclesDetected,
      duplicateServices
    };
  }

  private getRootLayer(moduleId: string): string {
    const parts = moduleId.split('/');
    return parts[0] || '';
  }

  private getSubsystem(moduleId: string): string | null {
    const parts = moduleId.split('/');
    if (parts[0] === 'core' && parts[1]) {
      return parts[1];
    }
    return null;
  }
}

export const moduleBoundaryValidator = new ModuleBoundaryValidator();
