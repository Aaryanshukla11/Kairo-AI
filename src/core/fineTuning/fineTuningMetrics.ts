import { FineTuningMetricModel } from './fineTuningTypes';

export class FineTuningMetrics {
  private metrics: Map<string, FineTuningMetricModel[]> = new Map();

  public logMetric(sessionId: string, metric: FineTuningMetricModel): void {
    let list = this.metrics.get(sessionId);
    if (!list) {
      list = [];
      this.metrics.set(sessionId, list);
    }
    list.push(metric);
    if (list.length > 500) {
      list.shift();
    }
  }

  public getMetrics(sessionId: string): FineTuningMetricModel[] {
    return this.metrics.get(sessionId) || [];
  }

  public clearSession(sessionId: string): void {
    this.metrics.delete(sessionId);
  }

  public clearAll(): void {
    this.metrics.clear();
  }
}

export const fineTuningMetrics = new FineTuningMetrics();
export default fineTuningMetrics;
