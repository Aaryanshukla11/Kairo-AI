import { IntegrationHistoryEntry } from './validationTypes';

export class IntegrationHistory {
  private history: IntegrationHistoryEntry[] = [];

  public recordEntry(entry: IntegrationHistoryEntry): void {
    this.history.push({ ...entry });
  }

  public getHistory(): IntegrationHistoryEntry[] {
    return [...this.history];
  }

  public getRecentRuns(limit: number = 10): IntegrationHistoryEntry[] {
    return this.history.slice(-limit).reverse();
  }

  public getSuccessRate(): number {
    if (this.history.length === 0) return 1.0;
    const successCount = this.history.filter(h => h.pipelineStatus === 'Success').length;
    return successCount / this.history.length;
  }

  public clear(): void {
    this.history = [];
  }
}

export const integrationHistory = new IntegrationHistory();
