import { RegistryMetrics } from './registryTypes';

export class RegistryMetricsTracker {
  private metrics: RegistryMetrics = {
    totalScans: 0,
    lastScanDurationMs: 0,
    registryLoadTimeMs: 0,
    cacheHitRate: 1.0
  };

  private cacheHits = 0;
  private cacheMisses = 0;

  public recordScan(durationMs: number): void {
    this.metrics.totalScans++;
    this.metrics.lastScanDurationMs = durationMs;
  }

  public recordLoadTime(durationMs: number): void {
    this.metrics.registryLoadTimeMs = durationMs;
  }

  public recordCacheAccess(isHit: boolean): void {
    if (isHit) this.cacheHits++;
    else this.cacheMisses++;

    const total = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = total > 0 ? this.cacheHits / total : 1.0;
  }

  public getMetrics(): RegistryMetrics {
    return { ...this.metrics };
  }
}

export const registryMetricsTracker = new RegistryMetricsTracker();
