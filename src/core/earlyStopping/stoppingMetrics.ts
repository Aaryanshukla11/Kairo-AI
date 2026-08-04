import { ValidationMetricModel } from '../validationLoop/validationTypes';

export class StoppingMetrics {
  private validationMetrics: Map<string, ValidationMetricModel[]> = new Map();

  public logValidationMetric(sessionId: string, metrics: ValidationMetricModel): void {
    let list = this.validationMetrics.get(sessionId);
    if (!list) {
      list = [];
      this.validationMetrics.set(sessionId, list);
    }
    list.push(metrics);
    if (list.length > 100) {
      list.shift();
    }
  }

  public getValidationHistory(sessionId: string): ValidationMetricModel[] {
    return this.validationMetrics.get(sessionId) || [];
  }

  public getMetricValues(sessionId: string, field: keyof ValidationMetricModel): number[] {
    const list = this.getValidationHistory(sessionId);
    return list.map(m => m[field] as number);
  }

  public clearSession(sessionId: string): void {
    this.validationMetrics.delete(sessionId);
  }

  public clearAll(): void {
    this.validationMetrics.clear();
  }
}

export const stoppingMetrics = new StoppingMetrics();
export default stoppingMetrics;
