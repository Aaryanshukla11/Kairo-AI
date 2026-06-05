import { OptimizationReport } from './optimizationTypes';

export class OptimizationHistory {
  private history: OptimizationReport[] = [];

  public logReport(report: OptimizationReport): void {
    this.history.push(report);
  }

  public getHistory(): OptimizationReport[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const optimizationHistory = new OptimizationHistory();
