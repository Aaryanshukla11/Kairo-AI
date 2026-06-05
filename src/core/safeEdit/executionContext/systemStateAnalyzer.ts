import * as os from 'os';

export class SystemStateAnalyzer {
  public getOS(): string {
    return os.platform();
  }
  public getDiskSpace(): { free: number; total: number } {
    return { free: 50 * 1024 * 1024 * 1024, total: 256 * 1024 * 1024 * 1024 };
  }
  public getMemory(): { free: number; total: number } {
    return { free: os.freemem(), total: os.totalmem() };
  }
  public getCPULoad(): number {
    return os.loadavg()[0] || 0.15;
  }
}
export const systemStateAnalyzer = new SystemStateAnalyzer();
