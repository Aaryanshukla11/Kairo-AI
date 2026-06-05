import { ValidationMetricModel } from './validationTypes';

export class ValidationMetrics {
  private sessionMetrics: Map<string, ValidationMetricModel[]> = new Map();

  public logMetrics(sessionId: string, metrics: ValidationMetricModel): void {
    let list = this.sessionMetrics.get(sessionId);
    if (!list) {
      list = [];
      this.sessionMetrics.set(sessionId, list);
    }
    list.push(metrics);

    if (list.length > 200) {
      list.shift();
    }
  }

  public getMetricsHistory(sessionId: string): ValidationMetricModel[] {
    return this.sessionMetrics.get(sessionId) || [];
  }

  public clearSession(sessionId: string): void {
    this.sessionMetrics.delete(sessionId);
  }

  public clearAll(): void {
    this.sessionMetrics.clear();
  }
}

export const validationMetrics = new ValidationMetrics();
export default validationMetrics;
