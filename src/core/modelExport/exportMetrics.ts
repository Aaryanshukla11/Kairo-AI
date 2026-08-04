import { ExportMetricModel } from './exportTypes';

export class ExportMetrics {
  private metrics: Map<string, ExportMetricModel[]> = new Map();

  public logMetric(exportId: string, metric: ExportMetricModel): void {
    let list = this.metrics.get(exportId);
    if (!list) {
      list = [];
      this.metrics.set(exportId, list);
    }
    list.push(metric);
  }

  public getMetrics(exportId: string): ExportMetricModel[] {
    return this.metrics.get(exportId) || [];
  }

  public clear(): void {
    this.metrics.clear();
  }
}

export const exportMetrics = new ExportMetrics();
export default exportMetrics;
