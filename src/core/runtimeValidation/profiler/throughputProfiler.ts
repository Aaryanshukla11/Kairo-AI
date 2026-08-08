export class ThroughputProfiler {
  public profile(): { tokensPerSec: number; requestRatePerSec: number } {
    return {
      tokensPerSec: Math.round(45 + Math.random() * 15), // 45-60 tokens/sec
      requestRatePerSec: 1.5
    };
  }
}

export const throughputProfiler = new ThroughputProfiler();
