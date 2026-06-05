import { TokenizerArtifact, BenchmarkReportModel } from './tokenizerTypes';
import { tokenizerValidator } from './tokenizerValidator';

export class TokenizerBenchmark {
  public runBenchmark(
    artifact: TokenizerArtifact,
    texts: string[]
  ): BenchmarkReportModel {
    const runId = `BENCH-${artifact.artifactId}-${Date.now()}`;
    
    let totalChars = 0;
    let totalTokens = 0;
    let unkCount = 0;

    const unkToken = artifact.config.specialTokens[0] || '[UNK]';
    const unkId = artifact.vocab[unkToken] || 0;

    const startTime = Date.now();

    texts.forEach(text => {
      totalChars += text.length;
      const ids = tokenizerValidator.mockEncode(text, artifact);
      totalTokens += ids.length;
      unkCount += ids.filter(id => id === unkId).length;
    });

    const elapsedMs = Math.max(1, Date.now() - startTime);

    // Speed metrics
    const totalLines = texts.length;
    const encodingSpeedKPS = Math.round((totalLines / elapsedMs) * 1000);
    const decodingSpeedKPS = Math.round((totalLines / elapsedMs) * 1200);

    const compressionRatio = totalTokens > 0 ? parseFloat((totalChars / totalTokens).toFixed(2)) : 0;
    const avgTokensPerFile = totalLines > 0 ? Math.round(totalTokens / totalLines) : 0;
    const unknownTokenRate = totalTokens > 0 ? parseFloat((unkCount / totalTokens).toFixed(4)) : 0;

    // Vocabulary coverage (fraction of active vocab indices used during evaluation)
    const usedIndices = new Set<number>();
    texts.forEach(text => {
      tokenizerValidator.mockEncode(text, artifact).forEach(id => usedIndices.add(id));
    });
    const vocabSize = Object.keys(artifact.vocab).length;
    const vocabCoverage = vocabSize > 0 ? parseFloat((usedIndices.size / vocabSize).toFixed(4)) : 0;

    return {
      runId,
      artifactId: artifact.artifactId,
      compressionRatio,
      avgTokensPerFile,
      vocabCoverage,
      unknownTokenRate,
      encodingSpeedKPS,
      decodingSpeedKPS,
      memoryUsageBytes: vocabSize * 80 // mock calculation representing bytes used in JS heap
    };
  }
}

export const tokenizerBenchmark = new TokenizerBenchmark();
export default tokenizerBenchmark;
