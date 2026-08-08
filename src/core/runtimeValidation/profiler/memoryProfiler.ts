export class MemoryProfiler {
  public profile(): { ramUsageBytes: number; maxHeapUsedBytes: number; hasLeakRisk: boolean } {
    const memory = process.memoryUsage();
    return {
      ramUsageBytes: memory.rss,
      maxHeapUsedBytes: memory.heapTotal,
      hasLeakRisk: memory.rss > 500 * 1024 * 1024 // Greater than 500MB is flagged
    };
  }
}

export const memoryProfiler = new MemoryProfiler();
