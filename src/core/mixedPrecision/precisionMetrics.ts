import { PrecisionMetrics, PrecisionMode } from './precisionTypes';

interface SessionMetrics {
  currentPrecision: PrecisionMode;
  scalingFactor: number;
  overflowCount: number;
  underflowCount: number;
  precisionChangesCount: number;
  hardwareSupported: boolean;
  timeline: Array<{
    step: number;
    precision: PrecisionMode;
    scalingFactor: number;
    hasOverflow: boolean;
  }>;
}

export class PrecisionMetricsManager {
  private sessionMetrics: Map<string, SessionMetrics> = new Map();

  public getOrCreateMetrics(sessionId: string): SessionMetrics {
    let metrics = this.sessionMetrics.get(sessionId);
    if (!metrics) {
      metrics = {
        currentPrecision: 'fp32',
        scalingFactor: 1.0,
        overflowCount: 0,
        underflowCount: 0,
        precisionChangesCount: 0,
        hardwareSupported: true,
        timeline: []
      };
      this.sessionMetrics.set(sessionId, metrics);
    }
    return metrics;
  }

  public recordStep(
    sessionId: string,
    step: number,
    precision: PrecisionMode,
    scale: number,
    hasOverflow: boolean,
    hasUnderflow: boolean,
    isHardwareSupported: boolean
  ): void {
    const metrics = this.getOrCreateMetrics(sessionId);

    // Track precision changes
    if (metrics.timeline.length > 0 && metrics.currentPrecision !== precision) {
      metrics.precisionChangesCount++;
    }

    metrics.currentPrecision = precision;
    metrics.scalingFactor = scale;
    metrics.hardwareSupported = isHardwareSupported;

    if (hasOverflow) {
      metrics.overflowCount++;
    }
    if (hasUnderflow) {
      metrics.underflowCount++;
    }

    metrics.timeline.push({
      step,
      precision,
      scalingFactor: scale,
      hasOverflow
    });

    // Cap timeline at 100 entries for efficiency
    if (metrics.timeline.length > 100) {
      metrics.timeline.shift();
    }
  }

  public getMetricsSummary(sessionId: string): PrecisionMetrics {
    const m = this.getOrCreateMetrics(sessionId);
    return {
      currentPrecision: m.currentPrecision,
      scalingFactor: m.scalingFactor,
      overflowCount: m.overflowCount,
      underflowCount: m.underflowCount,
      precisionChangesCount: m.precisionChangesCount,
      hardwareSupported: m.hardwareSupported,
      timeline: [...m.timeline]
    };
  }

  public clearSession(sessionId: string): void {
    this.sessionMetrics.delete(sessionId);
  }

  public clearAll(): void {
    this.sessionMetrics.clear();
  }
}

export const precisionMetrics = new PrecisionMetricsManager();
export default precisionMetrics;
