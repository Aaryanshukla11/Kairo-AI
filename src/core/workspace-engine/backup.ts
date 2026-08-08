import { IBackupRecord } from './types';
import { IFilesystemAdapter } from './fs-adapter';

export class BackupManager {
  private backups: Map<string, IBackupRecord> = new Map();

  public async recordBackup(filePath: string, fs: IFilesystemAdapter): Promise<void> {
    if (this.backups.has(filePath)) {
      return; // Already backed up this file in this execution session
    }

    const exists = await fs.exists(filePath);
    if (exists) {
      const content = await fs.readFile(filePath);
      this.backups.set(filePath, { filePath, originalContent: content });
    } else {
      this.backups.set(filePath, { filePath, originalContent: null });
    }
  }

  public async performRollback(fs: IFilesystemAdapter): Promise<boolean> {
    try {
      const records = Array.from(this.backups.values());
      // Rollback in reverse order of operations
      for (let i = records.length - 1; i >= 0; i--) {
        const record = records[i];
        if (record.originalContent === null) {
          // File did not exist originally, delete it
          const exists = await fs.exists(record.filePath);
          if (exists) {
            await fs.deleteFile(record.filePath);
          }
        } else {
          // Restore original content
          await fs.writeFile(record.filePath, record.originalContent);
        }
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  public clear(): void {
    this.backups.clear();
  }
}
