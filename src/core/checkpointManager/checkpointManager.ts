import {
  CheckpointModel,
  CheckpointManifestModel,
  RecoveryReportModel,
  RetentionPolicyConfig,
  CheckpointEventListener
} from './checkpointTypes';
import { checkpointEngine } from './checkpointEngine';
import { checkpointRestorer } from './checkpointRestorer';
import { checkpointRegistry } from './checkpointRegistry';
import { checkpointVersionManager } from './checkpointVersionManager';
import { checkpointComparator, CheckpointComparison } from './checkpointComparator';
import { checkpointRetention } from './checkpointRetention';
import { checkpointHistory } from './checkpointHistory';
import { checkpointMetrics } from './checkpointMetrics';
import { checkpointEvents } from './checkpointEvents';
import { checkpointStorage } from './checkpointStorage';

export class CheckpointManager {
  public async createCheckpoint(
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
    return checkpointEngine.create(
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
  }

  public restoreCheckpoint(checkpointId: string): CheckpointModel {
    return checkpointRestorer.restore(checkpointId);
  }

  public getCheckpointDetails(checkpointId: string): CheckpointModel | undefined {
    return checkpointRegistry.getCheckpoint(checkpointId);
  }

  public listCheckpoints(): CheckpointModel[] {
    return checkpointRegistry.listCheckpoints();
  }

  public getLineage(checkpointId: string) {
    return checkpointVersionManager.getLineage(checkpointId);
  }

  public compareCheckpoints(c1: CheckpointModel, c2: CheckpointModel): CheckpointComparison {
    return checkpointComparator.compare(c1, c2);
  }

  public applyRetention(policy: RetentionPolicyConfig): string[] {
    return checkpointRetention.applyPolicy(policy);
  }

  public getHistoryLogs() {
    return checkpointHistory.getHistory();
  }

  public getMetricsSummary() {
    return checkpointMetrics.getSummary();
  }

  public subscribe(listener: CheckpointEventListener): () => void {
    return checkpointEvents.subscribe(listener);
  }

  public clearHistory(): void {
    checkpointRegistry.clear();
    checkpointVersionManager.clear();
    checkpointHistory.clear();
    checkpointMetrics.clear();
    checkpointEvents.clear();
    checkpointStorage.clear();
  }
}

export const checkpointManager = new CheckpointManager();
export default checkpointManager;
