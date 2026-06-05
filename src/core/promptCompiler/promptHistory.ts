import { PromptReport } from './promptTypes';

export class PromptHistory {
  private history: PromptReport[] = [];

  public logReport(report: PromptReport): void {
    this.history.push(report);
  }

  public getHistory(): PromptReport[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const promptHistory = new PromptHistory();
