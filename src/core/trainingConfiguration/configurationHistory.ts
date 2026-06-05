export interface ConfigHistoryEntry {
  timestamp: number;
  timeStr: string;
  configId: string;
  action: string;
}

export class ConfigurationHistory {
  private history: ConfigHistoryEntry[] = [];

  public logAction(configId: string, action: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      configId,
      action
    });

    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  public getHistory(): ConfigHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const configurationHistory = new ConfigurationHistory();
export default configurationHistory;
