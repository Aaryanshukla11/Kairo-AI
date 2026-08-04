import { CheckpointModel } from '../checkpointManager/checkpointTypes';
import { TrainingConfigModel } from '../trainingConfiguration/configurationTypes';
import {
  ExportFormat,
  QuantizationType,
  ExportReport,
  ExportManifest,
  UnifiedModelArtifact,
  ExportEventListener
} from './exportTypes';
import { exportCoordinator } from './exportCoordinator';
import { exportRegistry } from './exportRegistry';
import { exportHistory } from './exportHistory';
import { exportMetrics } from './exportMetrics';
import { exportEvents } from './exportEvents';

export class ModelExportPipeline {
  public async exportModel(
    exportId: string,
    checkpoint: CheckpointModel,
    config: TrainingConfigModel,
    format: ExportFormat,
    quantization: QuantizationType,
    tokenizerVersion: string,
    modelId: string,
    version: string,
    parentModelId?: string,
    fineTuningMethod?: string
  ): Promise<{
    report: ExportReport;
    manifest: ExportManifest;
  }> {
    return exportCoordinator.executePipeline(
      exportId,
      checkpoint,
      config,
      format,
      quantization,
      tokenizerVersion,
      modelId,
      version,
      parentModelId,
      fineTuningMethod
    );
  }

  public getArtifact(artifactId: string): UnifiedModelArtifact | undefined {
    return exportRegistry.getArtifact(artifactId);
  }

  public listArtifacts(): UnifiedModelArtifact[] {
    return exportRegistry.listArtifacts();
  }

  public getHistory() {
    return exportHistory.getHistory();
  }

  public subscribe(listener: ExportEventListener): () => void {
    return exportEvents.subscribe(listener);
  }

  public clearHistory(): void {
    exportRegistry.clear();
    exportHistory.clear();
    exportMetrics.clear();
    exportEvents.clear();
  }
}

export const modelExportPipeline = new ModelExportPipeline();
export default modelExportPipeline;
