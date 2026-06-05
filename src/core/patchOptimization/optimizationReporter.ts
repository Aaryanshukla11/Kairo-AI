import { OptimizedPatchReport } from './optimizationTypes';

export class OptimizationReporter {
  public compile(
    id: string,
    originalSize: number,
    optimizedSize: number,
    merged: string[],
    removed: string[],
    risk: 'low' | 'medium' | 'high'
  ): OptimizedPatchReport {
    const ratio = originalSize > 0 ? (originalSize - optimizedSize) / originalSize : 0;

    return {
      patchId: id,
      originalPatchSize: originalSize,
      optimizedPatchSize: optimizedSize,
      optimizationRatio: ratio,
      mergedOperations: merged,
      removedOperations: removed,
      predictedMergeRisk: risk,
      diagnostics: [],
      confidence: 0.95
    };
  }
}

export const optimizationReporter = new OptimizationReporter();
