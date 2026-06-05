export interface HistoryLogEntry {
  timestamp: number;
  timeStr: string;
  event: string;
  datasetId?: string;
}

export class CollectorMetricsTracker {
  private totalCollectedFiles = 0;
  private totalCollectedBytes = 0;
  private collectionRunCount = 0;
  private historyLogs: HistoryLogEntry[] = [];

  public logCollection(fileCount: number, bytesCount: number = 0, datasetId?: string): void {
    this.totalCollectedFiles += fileCount;
    this.totalCollectedBytes += bytesCount;
    this.collectionRunCount += 1;

    this.addLog(`Collected ${fileCount} files (${bytesCount} bytes) for dataset ${datasetId || 'default'}`, datasetId);
  }

  public addLog(event: string, datasetId?: string): void {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    this.historyLogs.push({
      timestamp: Date.now(),
      timeStr,
      event,
      datasetId
    });

    if (this.historyLogs.length > 100) {
      this.historyLogs.shift();
    }
  }

  public getHistoryLogs(): HistoryLogEntry[] {
    return [...this.historyLogs];
  }

  public getStats() {
    return {
      totalFilesCollected: this.totalCollectedFiles,
      totalBytesCollected: this.totalCollectedBytes,
      collectionsCompleted: this.collectionRunCount
    };
  }

  public clear(): void {
    this.totalCollectedFiles = 0;
    this.totalCollectedBytes = 0;
    this.collectionRunCount = 0;
    this.historyLogs = [];
  }
}

export const collectorMetricsTracker = new CollectorMetricsTracker();
