export class ThreadOptimizer {
  public optimizeThreads(cpuUsage: number, currentThreads: number): { action: string; recommendedThreads: number } {
    if (cpuUsage > 80 && currentThreads > 4) {
      return { action: 'Throttle threads to prevent host lockup', recommendedThreads: currentThreads - 2 };
    }
    return { action: 'Maintain thread pools', recommendedThreads: currentThreads };
  }
}

export const threadOptimizer = new ThreadOptimizer();
