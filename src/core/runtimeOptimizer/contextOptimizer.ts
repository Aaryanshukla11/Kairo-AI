export class ContextOptimizer {
  public optimizeContext(usage: number): { action: string; maxLimit: number } {
    if (usage > 6000) {
      return { action: 'Force compression algorithms', maxLimit: 4096 };
    }
    return { action: 'Keep standard context budget', maxLimit: 8192 };
  }
}

export const contextOptimizer = new ContextOptimizer();
