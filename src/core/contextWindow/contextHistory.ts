import { ContextReport } from './contextTypes';

export class ContextHistory {
  private history: ContextReport[] = [];

  public logReport(report: ContextReport): void {
    this.history.push(report);
  }

  public getHistory(): ContextReport[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const contextHistory = new ContextHistory();
