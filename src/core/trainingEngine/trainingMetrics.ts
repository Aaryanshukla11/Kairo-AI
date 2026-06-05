import { TrainingMetricsModel } from './trainingTypes';

export class TrainingMetrics {
  private activeMetrics: TrainingMetricsModel[] = [];

  public logBatchMetrics(
    epoch: number,
    batch: number,
    trainingLoss: number,
    learningRate: number,
    gpu: number,
    vram: number,
    tokensPerSec: number,
    elapsedSec: number,
    totalSteps: number,
    currentStep: number,
    validationLoss?: number
  ): TrainingMetricsModel {
    const elapsed = Math.max(1, elapsedSec);
    const stepsRemaining = Math.max(0, totalSteps - currentStep);
    
    // Calculate simple ETA estimates
    const averageTimePerStep = elapsed / Math.max(1, currentStep);
    const estimatedRemainingSec = Math.round(stepsRemaining * averageTimePerStep);

    const record: TrainingMetricsModel = {
      epoch,
      batch,
      trainingLoss,
      validationLoss,
      learningRate,
      gpuUsagePercent: gpu,
      ramUsageMB: 4096, // 4GB mock RAM use
      vramUsageMB: vram,
      tokensPerSec,
      elapsedSec,
      estimatedRemainingSec
    };

    this.activeMetrics.push(record);
    return record;
  }

  public getMetrics(): TrainingMetricsModel[] {
    return [...this.activeMetrics];
  }

  public clear(): void {
    this.activeMetrics = [];
  }
}

export const trainingMetrics = new TrainingMetrics();
export default trainingMetrics;
