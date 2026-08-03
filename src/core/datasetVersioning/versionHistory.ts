export interface VersionHistoryEntry {
  timestamp: number;
  timeStr: string;
  datasetId: string;
  version: string;
  event: string;
}

export class VersionHistory {
  private history: VersionHistoryEntry[] = [];

  public logEvent(datasetId: string, version: string, event: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    this.history.push({
      timestamp: Date.now(),
      timeStr,
      datasetId,
      version,
      event
    });

    if (this.history.length > 200) {
      this.history.shift();
    }
  }

  public getHistory(): VersionHistoryEntry[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const versionHistory = new VersionHistory();
export default versionHistory;
