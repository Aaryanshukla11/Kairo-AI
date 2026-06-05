export class SchedulerOptimizer {
  public optimizeScheduler(queueSize: number): { action: string; nextIntervalMs: number } {
    if (queueSize > 3) {
      return { action: 'Fast schedule loop interval', nextIntervalMs: 50 };
    }
    return { action: 'Idle schedule loop interval', nextIntervalMs: 250 };
  }
}

export const schedulerOptimizer = new SchedulerOptimizer();
