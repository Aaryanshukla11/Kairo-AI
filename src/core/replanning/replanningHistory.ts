import { ReplanningReport } from './replanningTypes';

export class ReplanningHistoryManager {
  private history: ReplanningReport[] = [];

  record(report: ReplanningReport): void {
    this.history.push(report);
  }

  getHistory(): ReplanningReport[] {
    return [...this.history];
  }

  getByWorkflowId(workflowId: string): ReplanningReport[] {
    return this.history.filter(r => r.workflowId === workflowId);
  }

  clear(): void {
    this.history = [];
  }
}

export const replanningHistoryManager = new ReplanningHistoryManager();
