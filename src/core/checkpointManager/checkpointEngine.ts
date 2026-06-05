import {
  CheckpointModel,
  CheckpointManifestModel,
  RecoveryReportModel,
  CheckpointEventType
} from './checkpointTypes';
import { checkpointBuilder } from './checkpointBuilder';
import { checkpointValidator } from './checkpointValidator';
import { checkpointManifest } from './checkpointManifest';
import { checkpointStorage } from './checkpointStorage';
import { checkpointRegistry } from './checkpointRegistry';
import { checkpointVersionManager } from './checkpointVersionManager';
import { checkpointRecovery } from './checkpointRecovery';
import { checkpointHistory } from './checkpointHistory';
import { checkpointMetrics } from './checkpointMetrics';
import { checkpointEvents } from './checkpointEvents';

export class CheckpointEngine {
  public async create(
    version: string,
    parentId: string | undefined,
    trainingStep: number,
    epoch: number,
    globalStep: number,
    optimizerState: any,
    schedulerState: any,
    randomSeeds: Record<string, number>,
    tokenizerVersion: string,
    datasetVersion: string,
    configurationVersion: string,
    evaluationResults: { validationLoss: number; trainingLoss: number; accuracy?: number }
  ): Promise<{
    checkpoint: CheckpointModel;
    manifest: CheckpointManifestModel;
    recoveryReport: RecoveryReportModel;
  }> {
    
    // 1. Receive Training State
    checkpointEvents.emit(CheckpointEventType.TrainingStateReceived);

    // 2. Build Checkpoint Model (Calculates Checksum)
    const checkpoint = checkpointBuilder.buildCheckpoint(
      version,
      parentId,
      trainingStep,
      epoch,
      globalStep,
      optimizerState,
      schedulerState,
      randomSeeds,
      tokenizerVersion,
      datasetVersion,
      configurationVersion,
      evaluationResults
    );

    // 3. Validate State
    const validation = checkpointValidator.validateCheckpoint(checkpoint);
    if (!validation.isValid) {
      throw new Error(`Checkpoint Validation Error: ${validation.errors.join(', ')}`);
    }
    checkpointEvents.emit(CheckpointEventType.StateValidated);

    // 4. Create Snapshot & Generate Manifest
    const manifest = checkpointManifest.createManifest(checkpoint);
    checkpointEvents.emit(CheckpointEventType.SnapshotCreated);
    checkpointEvents.emit(CheckpointEventType.ManifestGenerated);

    // 5. Compress & Store Checkpoint
    checkpointStorage.saveCheckpoint(checkpoint);
    checkpointEvents.emit(CheckpointEventType.ArtifactCompressed);
    checkpointEvents.emit(CheckpointEventType.CheckpointStored);

    // 6. Register Artifact
    checkpointRegistry.registerCheckpoint(checkpoint);
    checkpointEvents.emit(CheckpointEventType.ArtifactRegistered);

    // 7. Version parent checkpoints linkages
    checkpointVersionManager.registerLineage(checkpoint.checkpointId, parentId);

    // 8. Generate Reports
    const recoveryReport = checkpointRecovery.generateRecoveryReport(checkpoint);
    checkpointHistory.logAction(checkpoint.checkpointId, `Stored step ${trainingStep} checkpoint.`);
    checkpointMetrics.logSave(checkpoint.isCompressed || false);

    checkpointEvents.emit(CheckpointEventType.ReportsGenerated, { checkpointId: checkpoint.checkpointId });

    return {
      checkpoint,
      manifest,
      recoveryReport
    };
  }
}

export const checkpointEngine = new CheckpointEngine();
export default checkpointEngine;
