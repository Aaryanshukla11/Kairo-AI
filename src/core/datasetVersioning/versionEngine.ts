import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import {
  DatasetVersionModel,
  DatasetSnapshotModel,
  VersionManifestModel,
  VersionEventType
} from './versionTypes';
import { datasetSnapshot } from './datasetSnapshot';
import { versionManifest } from './versionManifest';
import { versionBuilder } from './versionBuilder';
import { versionRegistry } from './versionRegistry';
import { lineageTracker } from './lineageTracker';
import { versionValidator } from './versionValidator';
import { versionHistory } from './versionHistory';
import { versionMetrics } from './versionMetrics';
import { versionEvents } from './versionEvents';

export class VersionEngine {
  public createVersion(
    datasetId: string,
    version: string,
    samples: CleanedSample[],
    parentVersion?: string,
    derivedFrom?: string,
    transformations: string[] = []
  ): {
    versionModel: DatasetVersionModel;
    snapshot: DatasetSnapshotModel;
    manifest: VersionManifestModel;
  } {
    // 1. Generate Snapshot (computes checksum and saves snapshot)
    const snapshot = datasetSnapshot.generateSnapshot(datasetId, version, samples);
    versionEvents.emit(VersionEventType.SnapshotGenerated, { snapshotId: snapshot.snapshotId });

    // 2. Estimate token count and build manifest
    // simple estimate: sum of character length divided by 4
    const tokenEstimate = samples.reduce((sum, s) => sum + Math.round((s.content || '').length / 4), 0);
    const manifest = versionManifest.createManifest(
      datasetId,
      version,
      snapshot.checksum,
      samples,
      tokenEstimate
    );
    versionEvents.emit(VersionEventType.ManifestCreated, { manifestId: manifest.manifestId });

    // 3. Build Version
    const versionModel = versionBuilder.buildVersion(
      datasetId,
      version,
      snapshot.checksum,
      samples,
      parentVersion
    );

    // 4. Update Registry (enforces immutability)
    versionRegistry.registerVersion(versionModel);
    versionEvents.emit(VersionEventType.RegistryUpdated, { version });

    // 5. Update Lineage Graph
    lineageTracker.registerNode(
      datasetId,
      version,
      parentVersion,
      derivedFrom,
      ['Deduplication', 'Cleaning'],
      transformations
    );

    // 6. Validate lineage integrity
    const lineageValidation = versionValidator.validateLineageIntegrity(versionModel);
    if (!lineageValidation.isValid) {
      throw new Error(`Lineage Validation Error: ${lineageValidation.errors.join(', ')}`);
    }
    versionEvents.emit(VersionEventType.LineageValidated, { version });

    // Save history logs and metrics
    versionHistory.logEvent(datasetId, version, `Created immutable version: ${version}`);
    versionMetrics.logRegistration(samples.length);

    versionEvents.emit(VersionEventType.VersionCreated, { versionModel });

    return {
      versionModel,
      snapshot,
      manifest
    };
  }
}

export const versionEngine = new VersionEngine();
export default versionEngine;
