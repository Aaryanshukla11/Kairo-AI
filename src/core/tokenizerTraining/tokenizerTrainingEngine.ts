import { TokenizerConfig, TokenizerArtifact, TokenizerManifestModel, BenchmarkReportModel, EvaluationReportModel, TokenizerEventType } from './tokenizerTypes';
import { tokenizerTrainer } from './tokenizerTrainer';
import { tokenizerBuilder } from './tokenizerBuilder';
import { tokenizerValidator } from './tokenizerValidator';
import { tokenizerBenchmark } from './tokenizerBenchmark';
import { tokenizerEvaluator } from './tokenizerEvaluator';
import { tokenizerRegistry } from './tokenizerRegistry';
import { tokenizerManifest } from './tokenizerManifest';
import { tokenizerVersionManager } from './tokenizerVersionManager';
import { tokenizerMetrics } from './tokenizerMetrics';
import { tokenizerEvents } from './tokenizerEvents';

export class TokenizerTrainingEngine {
  public async train(
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
    
    tokenizerEvents.emit(TokenizerEventType.TrainingStarted, { datasetId, version, config });
    tokenizerMetrics.addLog(`Loaded dataset with ${texts.length} samples.`);

    // 1. Text normalization
    const normalizedTexts = texts.map(t => t.normalize('NFC'));
    tokenizerEvents.emit(TokenizerEventType.TextNormalized);

    // 2. Train tokenizer
    const { vocab, mergeRules } = tokenizerTrainer.trainTokenizer(normalizedTexts, config);
    tokenizerEvents.emit(TokenizerEventType.TokenizerTrained, { vocabSize: Object.keys(vocab).length });

    // 3. Validate vocabulary
    const artifact = tokenizerBuilder.buildArtifact(
      datasetId,
      version,
      config.algorithm,
      vocab,
      mergeRules,
      config
    );

    const validation = tokenizerValidator.validateTokenizer(artifact, normalizedTexts);
    if (!validation.isValid) {
      throw new Error(`Tokenizer Validation Error: ${validation.errors.join(', ')}`);
    }
    tokenizerEvents.emit(TokenizerEventType.VocabValidated);

    // 4. Benchmark performance
    const benchmark = tokenizerBenchmark.runBenchmark(artifact, normalizedTexts);
    tokenizerEvents.emit(TokenizerEventType.BenchmarkCompleted, { benchmark });

    // 5. Evaluate quality
    const evaluation = tokenizerEvaluator.runEvaluation(artifact, normalizedTexts);
    tokenizerEvents.emit(TokenizerEventType.ReportsGenerated, { evaluation });

    // 6. Create manifest
    const manifest = tokenizerManifest.createManifest(artifact);

    // 7. Register Tokenizer & Version
    tokenizerRegistry.registerTokenizer(artifact, manifest);
    tokenizerEvents.emit(TokenizerEventType.TokenizerRegistered, { artifactId: artifact.artifactId });

    // 8. Version links
    tokenizerVersionManager.registerRelation(datasetId, version, parentVersion);
    tokenizerEvents.emit(TokenizerEventType.ArtifactVersioned, { version });

    tokenizerMetrics.logTraining(config.algorithm, datasetId, version);

    return {
      artifact,
      manifest,
      benchmark,
      evaluation
    };
  }
}

export const tokenizerTrainingEngine = new TokenizerTrainingEngine();
export default tokenizerTrainingEngine;
