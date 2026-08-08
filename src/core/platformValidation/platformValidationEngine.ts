import { 
  IValidationProvider, 
  PlatformValidationReport, 
  PlatformHealthReport,
  ValidationResult,
  ValidationContext
} from './validationTypes';
import { dependencyGraph } from './dependencyGraph';
import { moduleBoundaryValidator } from './moduleBoundaryValidator';
import { architectureAuditor } from './architectureAuditor';
import { dependencyAuditor } from './dependencyAuditor';
import { registryValidator } from './registryValidator';
import { eventValidator } from './eventValidator';
import { providerValidator } from './providerValidator';
import { interfaceValidator } from './interfaceValidator';
import { integrationCoordinator } from './integrationCoordinator';
import { architectureHealth } from './architectureHealth';
import { validationReportGenerator } from './validationReport';

// Default providers import
import { architectureProvider } from './providers/architectureProvider';
import { validationProvider } from './providers/validationProvider';
import { integrationProvider } from './providers/integrationProvider';

export class PlatformValidationEngine {
  private providers = new Map<string, IValidationProvider>();

  constructor() {
    // Register baseline validation providers
    this.registerProvider(architectureProvider);
    this.registerProvider(validationProvider);
    this.registerProvider(integrationProvider);
    
    // Also register custom ones
    this.registerProvider(registryValidator);
    this.registerProvider(eventValidator);
    this.registerProvider(providerValidator);
    this.registerProvider(interfaceValidator);
  }

  public registerProvider(provider: IValidationProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Registration Error: Provider with ID '${provider.id}' is already registered.`);
    }
    this.providers.set(provider.id, provider);
  }

  public getProviders(): IValidationProvider[] {
    return Array.from(this.providers.values());
  }

  public async runAllValidations(): Promise<{ report: PlatformValidationReport; health: PlatformHealthReport }> {
    const reportId = `report-${Date.now()}`;
    const context: ValidationContext = { timestamp: Date.now() };

    const results: Record<string, ValidationResult> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // Run all registered validation providers
    for (const [id, provider] of this.providers.entries()) {
      try {
        const result = await provider.validate(context);
        results[id] = result;
        if (result.errors) errors.push(...result.errors.map(e => `[${provider.name}] ${e}`));
        if (result.warnings) warnings.push(...result.warnings.map(w => `[${provider.name}] ${w}`));
      } catch (err: any) {
        errors.push(`[${provider.name}] Crashed: ${err.message || err}`);
        results[id] = {
          name: provider.name,
          status: 'Failed',
          score: 0,
          details: `Validation failed with fatal error: ${err.message || err}`,
          errors: [err.message || err.toString()]
        };
      }
    }

    // Generate Dependency Graph
    const graphData = dependencyGraph.generate();

    // Generate Module Boundary Report
    const boundaryReport = moduleBoundaryValidator.getBoundaryReport();

    // Execute the Integration Coordinator (runs full 13 stage pipeline flow)
    const pipelineSteps = await integrationCoordinator.executeAndTrack(reportId);
    
    // Check overall pipeline status
    const failedSteps = pipelineSteps.filter(s => s.status === 'Failed');
    const pipelineStatus = failedSteps.length === 0 ? 'Success' : 'Failed';

    // Scores calculation
    const architectureScore = results['architecture-provider']?.score ?? 100;
    const dependencyGraphScore = results['validation-provider']?.score ?? 100;
    const moduleHealthScore = results['module-boundary-validator']?.score ?? 100;
    const providerHealthScore = results['provider-validator']?.score ?? 100;
    const registryHealthScore = results['registry-validator']?.score ?? 100;
    
    let pipelineHealthScore = 100;
    if (pipelineSteps.length > 0) {
      const passedSteps = pipelineSteps.filter(s => s.status === 'Success').length;
      pipelineHealthScore = Math.round((passedSteps / pipelineSteps.length) * 100);
    }

    const integrationScore = results['integration-provider']?.score ?? pipelineHealthScore;

    // Platform health aggregate
    const health = architectureHealth.aggregateHealth(results);
    const overallHealthScore = health.overallScore;

    // Platform validation report compiling
    const validationReport: PlatformValidationReport = {
      id: reportId,
      timestamp: Date.now(),
      overallHealthScore,
      scores: {
        architecture: architectureScore,
        integration: integrationScore,
        dependencyGraph: dependencyGraphScore,
        moduleHealth: moduleHealthScore,
        providerHealth: providerHealthScore,
        registryHealth: registryHealthScore,
        pipelineHealth: pipelineHealthScore
      },
      results,
      dependencyGraph: graphData,
      boundaryReport,
      pipelineStatus,
      pipelineSteps,
      errors,
      warnings,
      recommendations: health.recoveryRecommendations
    };

    // Cache latest report
    this.latestReport = validationReport;

    // Save Markdown reports directly to workspace root
    validationReportGenerator.generateAndSaveReports(validationReport, health);

    return {
      report: validationReport,
      health
    };
  }

  private latestReport: PlatformValidationReport | null = null;

  public getLatestReport(): PlatformValidationReport | null {
    return this.latestReport;
  }
}

export const platformValidationEngine = new PlatformValidationEngine();
export default platformValidationEngine;
