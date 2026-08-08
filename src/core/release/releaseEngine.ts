import * as path from 'path';
import { 
  IReleaseValidationProvider, 
  ReleaseManifestModel, 
  ReleaseHealthReport,
  ReleaseQualityGate 
} from './releaseTypes';

import { documentationProvider } from './providers/documentationProvider';
import { releaseProvider } from './providers/releaseProvider';
import { dogfoodingProvider } from './providers/dogfoodingProvider';

import { documentationGenerator } from './documentation/documentationGenerator';
import { dogfoodingEngine } from './dogfooding/dogfoodingEngine';
import { releaseCoordinator } from './releaseCoordinator';
import { releaseBuilder } from './releaseBuilder';
import { releaseHistory } from './releaseHistory';
import { releaseMetrics } from './releaseMetrics';
import { releaseEvents } from './releaseEvents';
import { releaseChecklist } from './rcBuilder/releaseChecklist';

export class ReleaseEngine {
  private providers = new Map<string, IReleaseValidationProvider>();
  private workspaceRoot: string;

  constructor(workspaceRoot: string = path.resolve(__dirname, '../../../')) {
    this.workspaceRoot = workspaceRoot;

    // Register baseline providers
    this.registerProvider(documentationProvider);
    this.registerProvider(releaseProvider);
    this.registerProvider(dogfoodingProvider);
  }

  public registerProvider(provider: IReleaseValidationProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Registration Error: Provider with ID '${provider.id}' is already registered.`);
    }
    this.providers.set(provider.id, provider);
  }

  public getProviders(): IReleaseValidationProvider[] {
    return Array.from(this.providers.values());
  }

  public async runReleasePipeline(version: string = '0.1.0-rc1'): Promise<{
    manifest: ReleaseManifestModel;
    health: ReleaseHealthReport;
    gate: ReleaseQualityGate;
    dogfoodResult: any;
  }> {
    releaseMetrics.incrementBuilds();
    releaseEvents.publish('BuildStarted', { version });

    // 1. Generate all required Markdown documents first
    documentationGenerator.generateAll(this.workspaceRoot);
    releaseEvents.publish('DocumentationGenerated', { files: ['DEVELOPER_GUIDE.md', 'INSTALLATION_GUIDE.md', 'CONTRIBUTING.md', 'API_DOCUMENTATION.md', 'ARCHITECTURE_DOCUMENTATION.md'] });

    // 2. Execute Dogfooding run (feature request plan, test compilation check, safe edits)
    const dogfoodResult = await dogfoodingEngine.executeDogfooding(
      'Audit event registry dead letter queue configurations thresholds',
      this.workspaceRoot
    );
    releaseEvents.publish('DogfoodingComplete', dogfoodResult);

    // 3. Collect health matrices and checklist gates
    const health = releaseCoordinator.calculateHealthSummary();
    const gate = releaseChecklist.evaluateGate();
    
    // Evaluate Autonomous Release Quality Gate checks
    const gatePassed = Object.values(gate).every(Boolean);
    if (!gatePassed) {
      releaseMetrics.incrementFailures();
      releaseEvents.publish('QualityGateFailed', { gate });
      throw new Error('Autonomous Release Quality Gate checks failed. Cannot generate Release Candidate 1.');
    }

    // 4. Build Release Candidate (packages VSIX zip, compiles manifest lists, notes, and compatibility matrices)
    const manifest = await releaseBuilder.buildReleaseCandidate(version, this.workspaceRoot, health, gate);
    
    releaseHistory.saveRelease(manifest);
    releaseMetrics.incrementSuccesses();
    releaseEvents.publish('BuildSuccess', { version, manifest });

    return {
      manifest,
      health,
      gate,
      dogfoodResult
    };
  }

  public getLatestManifest(version: string = '0.1.0-rc1'): ReleaseManifestModel | undefined {
    return releaseHistory.getRelease(version);
  }
}

export const releaseEngine = new ReleaseEngine();
export default releaseEngine;
