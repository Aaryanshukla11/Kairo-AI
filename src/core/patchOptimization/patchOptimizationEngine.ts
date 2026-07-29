import { patchAnalyzer } from './patchAnalyzer';
import { patchReducer } from './patchReducer';
import { patchMerger } from './patchMerger';
import { conflictPredictor } from './conflictPredictor';
import { optimizationValidator } from './optimizationValidator';
import { optimizationReporter } from './optimizationReporter';
import { optimizationEvents } from './optimizationEvents';
import { optimizationMetrics } from './optimizationMetrics';
import { OptimizedPatchReport, OptimizationEventType } from './optimizationTypes';

export class PatchOptimizationEngine {
  public async optimizePatch(targetFile: string, patchContent: string): Promise<OptimizedPatchReport> {
    optimizationEvents.emit(OptimizationEventType.OptimizationStarted, { targetFile });

    const ops = patchAnalyzer.parseOps(patchContent);
    optimizationEvents.emit(OptimizationEventType.PatchAnalyzed, { opsCount: ops.length });

    const { merged, mergedLogs } = patchMerger.merge(ops);
    optimizationEvents.emit(OptimizationEventType.OperationsMerged, { mergedCount: merged.length });

    const { reduced, removed } = patchReducer.reduce(merged);
    optimizationEvents.emit(OptimizationEventType.PatchReduced, { reducedCount: reduced.length });

    optimizationValidator.validate(reduced);
    optimizationEvents.emit(OptimizationEventType.OptimizationValidated, { validatedCount: reduced.length });

    const risk = conflictPredictor.predictRisk(reduced);
    const originalSize = patchContent.length;
    // Calculate a simulated optimized size
    const saved = removed.length * 15 + mergedLogs.length * 8;
    const optimizedSize = Math.max(10, originalSize - saved);

    const report = optimizationReporter.compile(
      Date.now().toString(),
      originalSize,
      optimizedSize,
      mergedLogs,
      removed,
      risk
    );

    optimizationMetrics.record(originalSize - optimizedSize);
    optimizationEvents.emit(OptimizationEventType.OptimizationCompleted, { report });

    return report;
  }

  public subscribe(listener: any): () => void {
    return optimizationEvents.subscribe(listener);
  }
}

export const patchOptimizationEngine = new PatchOptimizationEngine();
