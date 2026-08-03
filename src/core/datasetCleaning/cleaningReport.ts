import { CleaningReportModel, CleanedSample, RejectedSample } from './cleaningTypes';
import { qualityAnalyzer } from './qualityAnalyzer';

export class CleaningReport {
  public generateReport(
    runId: string,
    datasetId: string,
    samplesProcessed: number,
    cleaned: CleanedSample[],
    rejected: RejectedSample[]
  ): CleaningReportModel {
    // 1. Analyze Quality
    const qualityRes = qualityAnalyzer.analyzeQuality(cleaned);

    // 2. Count normalizations applied
    const normSummary = {
      utf8NormalizedCount: 0,
      lineEndingsNormalizedCount: 0,
      whitespaceNormalizedCount: 0,
      filenamesNormalizedCount: 0,
      languagesNormalizedCount: 0,
      metadataNormalizedCount: 0
    };

    for (const sample of cleaned) {
      for (const norm of sample.normalizationsApplied) {
        if (norm.includes('UTF-8')) normSummary.utf8NormalizedCount++;
        if (norm.includes('Whitespace')) normSummary.whitespaceNormalizedCount++;
        if (norm.includes('Line Ending')) normSummary.lineEndingsNormalizedCount++;
        if (norm.includes('Language')) normSummary.languagesNormalizedCount++;
        if (norm.includes('Metadata')) normSummary.metadataNormalizedCount++;
        if (norm.includes('Path')) normSummary.filenamesNormalizedCount++;
      }
    }

    // 3. Count rejection reasons
    const reasonsMap: Record<string, number> = {};
    for (const sample of rejected) {
      for (const reason of sample.rejectionReasons) {
        reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
      }
    }

    return {
      pipelineRunId: runId,
      datasetId,
      timestamp: Date.now(),
      samplesProcessed,
      acceptedCount: cleaned.length,
      rejectedCount: rejected.length,
      normalizationSummary: normSummary,
      qualityMetrics: qualityRes.metrics,
      rejectionReasonsDistribution: reasonsMap,
      qualityDistribution: qualityRes.qualityDistribution
    };
  }
}

export const cleaningReport = new CleaningReport();
