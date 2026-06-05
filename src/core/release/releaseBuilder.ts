import { artifactCollector } from './rcBuilder/artifactCollector';
import { packageBuilder } from './rcBuilder/packageBuilder';
import { versionManifest } from './rcBuilder/versionManifest';
import { compatibilityReport } from './rcBuilder/compatibilityReport';
import { releaseNotes } from './rcBuilder/releaseNotes';
import { healthReport } from './rcBuilder/healthReport';
import { ReleaseHealthReport, ReleaseManifestModel, ReleaseQualityGate } from './releaseTypes';

export class ReleaseBuilder {
  public async buildReleaseCandidate(
    version: string,
    workspaceRoot: string,
    health: ReleaseHealthReport,
    gate: ReleaseQualityGate
  ): Promise<ReleaseManifestModel> {
    
    // 1. Collect files list
    const files = artifactCollector.collectPackagedFiles(workspaceRoot);

    // 2. Package VSIX ZIP file
    packageBuilder.buildPackage(workspaceRoot, files);

    // 3. Compile RC1 compatibility, manifests, release notes, and health reports
    compatibilityReport.generate(workspaceRoot);
    releaseNotes.generate(workspaceRoot);
    versionManifest.generate(workspaceRoot, files);
    healthReport.generate(workspaceRoot, health);

    const checksums: Record<string, string> = {};
    for (const f of files) {
      checksums[f] = '4bdf69a68e82ef620e793ed1d72cf0146f41426466f28cf085b306b6fbf285f5'; // mock sha256
    }

    return {
      version,
      timestamp: Date.now(),
      environment: 'production',
      qualityGate: gate,
      healthReport: health,
      packagedFiles: files,
      dependencyMap: {
        vscode: '^1.80.0'
      },
      checksums
    };
  }
}

export const releaseBuilder = new ReleaseBuilder();
