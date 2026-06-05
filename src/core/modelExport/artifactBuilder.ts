import { UnifiedModelArtifact, ExportFormat, QuantizationType, CompatibilityMatrix } from './exportTypes';

export class ArtifactBuilder {
  public buildUMA(
    modelId: string,
    version: string,
    baseModelId: string,
    datasetVersion: string,
    tokenizerVersion: string,
    trainingConfigId: string,
    checkpointId: string,
    evaluationResults: Record<string, number>,
    exportFormat: ExportFormat,
    quantization: QuantizationType,
    manifestChecksum: string,
    artifactChecksum: string,
    compatibilityReport: CompatibilityMatrix,
    fileSize: number,
    parentModelId?: string,
    fineTuningMethod?: string
  ): UnifiedModelArtifact {
    const artifactId = `UMA-${modelId}-${version}-${exportFormat}-${quantization}`;
    return {
      artifactId,
      modelId,
      version,
      parentModelId,
      baseModelId,
      fineTuningMethod,
      datasetVersion,
      tokenizerVersion,
      trainingConfigId,
      checkpointId,
      evaluationResults,
      exportFormat,
      quantization,
      manifestChecksum,
      artifactChecksum,
      compatibilityReport,
      creationTimestamp: Date.now(),
      fileSize
    };
  }
}

export const artifactBuilder = new ArtifactBuilder();
export default artifactBuilder;
