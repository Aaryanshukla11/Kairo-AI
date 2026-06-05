import { PipelineStepResult } from './validationTypes';

export class IntegrationMetrics {
  private stepMetrics = new Map<string, PipelineStepResult[]>();

  public recordStep(result: PipelineStepResult): void {
    if (!this.stepMetrics.has(result.stage)) {
      this.stepMetrics.set(result.stage, []);
    }
    this.stepMetrics.get(result.stage)!.push({ ...result });
  }

  public getMetricsForStage(stage: string): PipelineStepResult[] {
    return this.stepMetrics.get(stage) || [];
  }

  public getAverageDurationMs(stage: string): number {
    const runs = this.getMetricsForStage(stage);
    if (runs.length === 0) return 0;
    const sum = runs.reduce((acc, curr) => acc + curr.durationMs, 0);
    return sum / runs.length;
  }

  public clear(): void {
    this.stepMetrics.clear();
  }
}

export const integrationMetrics = new IntegrationMetrics();
