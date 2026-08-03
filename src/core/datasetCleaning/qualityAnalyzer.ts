import { CleanedSample, QualityMetrics } from './cleaningTypes';
import { qualityScorer } from './qualityScorer';

export class QualityAnalyzer {
  public analyzeQuality(samples: CleanedSample[]): { metrics: QualityMetrics; qualityDistribution: Record<string, number> } {
    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    if (samples.length === 0) {
      return {
        metrics: {
          averageQualityScore: 0,
          syntaxValidityCount: 0,
          metadataCompletenessCount: 0,
          formattingConsistencyCount: 0,
          encodingQualityCount: 0,
          sampleCompletenessCount: 0
        },
        qualityDistribution: distribution
      };
    }

    let totalScore = 0;
    let syntaxValidCount = 0;
    let metadataCompleteCount = 0;
    let formattingConsistentCount = 0;
    let encodingQualityCount = 0;
    let sampleCompletenessCount = 0;

    for (const sample of samples) {
      const score = sample.qualityScore;
      totalScore += score;

      // Group distribution
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;

      // Evaluate breakdown flags
      // We can convert sample to a full CollectedFileItem for quality evaluation
      const breakdown = qualityScorer.evaluateQuality({
        filePath: sample.filePath,
        content: sample.content,
        sizeBytes: sample.cleanedSizeBytes,
        provenance: sample.provenance
      }).breakdown;

      if (breakdown.syntaxValidity >= 80) syntaxValidCount++;
      if (breakdown.metadataCompleteness >= 80) metadataCompleteCount++;
      if (breakdown.formattingConsistency >= 80) formattingConsistentCount++;
      if (breakdown.encodingQuality >= 80) encodingQualityCount++;
      if (breakdown.sampleCompleteness >= 80) sampleCompletenessCount++;
    }

    const averageQualityScore = Math.round(totalScore / samples.length);

    return {
      metrics: {
        averageQualityScore,
        syntaxValidityCount: syntaxValidCount,
        metadataCompletenessCount: metadataCompleteCount,
        formattingConsistencyCount: formattingConsistentCount,
        encodingQualityCount: encodingQualityCount,
        sampleCompletenessCount: sampleCompletenessCount
      },
      qualityDistribution: distribution
    };
  }
}

export const qualityAnalyzer = new QualityAnalyzer();
