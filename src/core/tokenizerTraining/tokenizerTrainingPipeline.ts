import { TokenizerConfig, TokenizerArtifact, TokenizerManifestModel, BenchmarkReportModel, EvaluationReportModel, TokenizerEventListener } from './tokenizerTypes';
import { tokenizerTrainingEngine } from './tokenizerTrainingEngine';
import { tokenizerRegistry } from './tokenizerRegistry';
import { tokenizerVersionManager } from './tokenizerVersionManager';
import { tokenizerMetrics } from './tokenizerMetrics';
import { tokenizerEvents } from './tokenizerEvents';

export class TokenizerTrainingPipeline {
  public async trainTokenizer(
    datasetId: string,
    version: string,
    texts: string[],
    config: TokenizerConfig,
    parentVersion?: string
  ): Promise<{
    artifact: TokenizerArtifact;
    manifest: TokenizerManifestModel;
    benchmark: BenchmarkReportModel;
    evaluation: EvaluationReportModel;
  }> {
    return tokenizerTrainingEngine.train(datasetId, version, texts, config, parentVersion);
  }

  public getTokenizerArtifact(datasetId: string, version: string, algorithm: string): TokenizerArtifact | undefined {
    return tokenizerRegistry.getTokenizer(datasetId, version, algorithm);
  }

  public getManifest(datasetId: string, version: string, algorithm: string): TokenizerManifestModel | undefined {
    return tokenizerRegistry.getManifest(datasetId, version, algorithm);
  }

  public listRegisteredTokenizers(): TokenizerArtifact[] {
    return tokenizerRegistry.listTokenizers();
  }

  public getVersionRelation(datasetId: string, version: string) {
    return tokenizerVersionManager.getRelation(datasetId, version);
  }

  public getHistoryLogs() {
    return tokenizerMetrics.getHistoryLogs();
  }

  public getMetricsSummary() {
    return tokenizerMetrics.getStats();
  }

  public subscribe(listener: TokenizerEventListener): () => void {
    return tokenizerEvents.subscribe(listener);
  }

  public clearHistory(): void {
    tokenizerRegistry.clear();
    tokenizerVersionManager.clear();
    tokenizerMetrics.clear();
    tokenizerEvents.clear();
  }
}

export const tokenizerTrainingPipeline = new TokenizerTrainingPipeline();
export default tokenizerTrainingPipeline;
