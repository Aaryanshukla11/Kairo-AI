import { CollectedFileItem } from '../datasetCollector/collectorTypes';
import { CleanedSample, RejectedSample, CleaningReportModel, CleaningRulesConfig, CleaningEventType } from './cleaningTypes';
import { cleaningRules } from './cleaningRules';
import { cleaningValidator } from './cleaningValidator';
import { cleaningMetrics } from './cleaningMetrics';
import { cleaningEvents } from './cleaningEvents';
import { cleaningHistory } from './cleaningHistory';
import { cleaningReport } from './cleaningReport';
import { cleaningCoordinator } from './cleaningCoordinator';

export class CleaningEngine {
  public async clean(
    datasetId: string,
    collectedDataset: CollectedFileItem[],
    customConfig?: Partial<CleaningRulesConfig>
  ): Promise<{ runId: string; cleanedSamples: CleanedSample[]; rejectedSamples: RejectedSample[]; report: CleaningReportModel }> {
    
    const runId = `RUN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    cleaningHistory.logEvent(datasetId, runId, `Starting cleaning pipeline for dataset: ${datasetId}`);
    cleaningEvents.emit(CleaningEventType.PipelineStarted, { datasetId, runId, totalSamples: collectedDataset.length });

    const config = cleaningRules.getRules(customConfig);
    const cleanedSamples: CleanedSample[] = [];
    const rejectedSamples: RejectedSample[] = [];

    // Reset Metrics
    cleaningMetrics.clear();

    for (const rawSample of collectedDataset) {
      // 1. Validate Samples & 2. Normalize Encoding & 3. Normalize Metadata & 4. Normalize Formatting & 5. Detect Corruption & 6. Repair & 7. Assign Quality Scores
      const result = cleaningCoordinator.processSample(rawSample, config);

      if (result.status === 'accepted' || result.status === 'repaired') {
        const cleaned = result.cleanedSample!;
        
        // Final sanity check for provenance retention
        const validation = cleaningValidator.validateCleanedSample(cleaned);
        if (validation.isValid) {
          cleanedSamples.push(cleaned);
          cleaningMetrics.trackSample(true);
          cleaningMetrics.trackNormalizations(result.normalizationsApplied);
          
          if (result.status === 'repaired') {
            cleaningEvents.emit(CleaningEventType.SampleRepaired, { filePath: cleaned.filePath });
          } else {
            cleaningEvents.emit(CleaningEventType.SampleValidated, { filePath: cleaned.filePath });
          }
        } else {
          // If provenance fails, reject the sample
          const rejected: RejectedSample = {
            filePath: rawSample.filePath,
            originalContent: rawSample.content,
            provenance: rawSample.provenance,
            rejectionReasons: [...validation.errors, 'Provenance verification failed on cleaned output.']
          };
          rejectedSamples.push(rejected);
          cleaningMetrics.trackSample(false);
          cleaningEvents.emit(CleaningEventType.CorruptionDetected, { filePath: rawSample.filePath, reasons: rejected.rejectionReasons });
        }
      } else {
        const rejected = result.rejectedSample!;
        cleaningValidator.validateRejectedSample(rejected);
        rejectedSamples.push(rejected);
        cleaningMetrics.trackSample(false);
        cleaningEvents.emit(CleaningEventType.CorruptionDetected, { filePath: rawSample.filePath, reasons: rejected.rejectionReasons });
      }
    }

    // 8. Generate Clean Dataset Report
    const reportData = cleaningReport.generateReport(
      runId,
      datasetId,
      collectedDataset.length,
      cleanedSamples,
      rejectedSamples
    );

    cleaningHistory.logEvent(
      datasetId,
      runId,
      `Completed cleaning. Accepted: ${cleanedSamples.length}, Rejected: ${rejectedSamples.length}`
    );

    cleaningEvents.emit(CleaningEventType.PipelineCompleted, { runId, report: reportData });

    return {
      runId,
      cleanedSamples,
      rejectedSamples,
      report: reportData
    };
  }
}

export const cleaningEngine = new CleaningEngine();
