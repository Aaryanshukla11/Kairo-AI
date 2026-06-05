import { GradientReportModel } from '../gradientEngine/gradientTypes';
import { LossReportModel } from '../lossEngine/lossTypes';
import { OverflowReport } from './precisionTypes';

interface OverflowState {
  overflowCount: number;
  underflowCount: number;
  consecutiveOverflowsAtMinScale: number;
  lastOverflowStep?: number;
}

export class OverflowMonitor {
  private sessionOverflows: Map<string, OverflowState> = new Map();

  public monitorExecution(
    sessionId: string,
    currentStep: number,
    gradientReport?: GradientReportModel,
    lossReport?: LossReportModel,
    isScaleAtMin: boolean = false
  ): OverflowReport {
    let state = this.sessionOverflows.get(sessionId);
    if (!state) {
      state = {
        overflowCount: 0,
        underflowCount: 0,
        consecutiveOverflowsAtMinScale: 0
      };
      this.sessionOverflows.set(sessionId, state);
    }

    let hasOverflow = false;
    let hasUnderflow = false;
    const layerIssues: Array<{ layerName: string; issueType: 'NaN' | 'Infinity' | 'Underflow' }> = [];

    // 1. Inspect loss report
    if (lossReport) {
      const lossVal = lossReport.currentLoss;
      if (Number.isNaN(lossVal)) {
        hasOverflow = true;
        layerIssues.push({ layerName: 'loss', issueType: 'NaN' });
      } else if (!Number.isFinite(lossVal)) {
        hasOverflow = true;
        layerIssues.push({ layerName: 'loss', issueType: 'Infinity' });
      }
    }

    // 2. Inspect gradient layers
    if (gradientReport && gradientReport.layers) {
      for (const layer of gradientReport.layers) {
        let layerHasNaN = false;
        let layerHasInf = false;
        let layerHasUnderflow = false;

        // Check summary stats
        if (Number.isNaN(layer.gradNorm) || Number.isNaN(layer.gradMean) || Number.isNaN(layer.gradVariance)) {
          layerHasNaN = true;
        }
        if (!Number.isFinite(layer.gradNorm) || !Number.isFinite(layer.gradMean) || !Number.isFinite(layer.gradVariance)) {
          layerHasInf = true;
        }

        // Check values if available
        if (layer.values && layer.values.length > 0) {
          for (const val of layer.values) {
            if (Number.isNaN(val)) {
              layerHasNaN = true;
            } else if (!Number.isFinite(val)) {
              layerHasInf = true;
            } else if (val !== 0 && Math.abs(val) < 1e-12) {
              layerHasUnderflow = true;
            }
          }
        }

        if (layerHasNaN) {
          hasOverflow = true;
          layerIssues.push({ layerName: layer.layerName, issueType: 'NaN' });
        }
        if (layerHasInf) {
          hasOverflow = true;
          layerIssues.push({ layerName: layer.layerName, issueType: 'Infinity' });
        }
        if (layerHasUnderflow) {
          hasUnderflow = true;
          layerIssues.push({ layerName: layer.layerName, issueType: 'Underflow' });
        }
      }
    }

    // Update counts
    if (hasOverflow) {
      state.overflowCount++;
      state.lastOverflowStep = currentStep;
      if (isScaleAtMin) {
        state.consecutiveOverflowsAtMinScale++;
      } else {
        state.consecutiveOverflowsAtMinScale = 0;
      }
    } else {
      state.consecutiveOverflowsAtMinScale = 0;
    }

    if (hasUnderflow) {
      state.underflowCount++;
    }

    // A persistent overflow is defined as 5 consecutive steps of overflow when scale is at minimum.
    const persistentOverflow = state.consecutiveOverflowsAtMinScale >= 5;

    return {
      hasOverflow,
      overflowCount: state.overflowCount,
      underflowCount: state.underflowCount,
      hasUnderflow,
      persistentOverflow,
      lastOverflowStep: state.lastOverflowStep,
      layerIssues
    };
  }

  public getOverflowReport(sessionId: string): OverflowReport {
    const state = this.sessionOverflows.get(sessionId);
    if (!state) {
      return {
        hasOverflow: false,
        overflowCount: 0,
        underflowCount: 0,
        hasUnderflow: false,
        persistentOverflow: false,
        layerIssues: []
      };
    }

    return {
      hasOverflow: false,
      overflowCount: state.overflowCount,
      underflowCount: state.underflowCount,
      hasUnderflow: false,
      persistentOverflow: state.consecutiveOverflowsAtMinScale >= 5,
      lastOverflowStep: state.lastOverflowStep,
      layerIssues: []
    };
  }

  public clearSession(sessionId: string): void {
    this.sessionOverflows.delete(sessionId);
  }

  public clearAll(): void {
    this.sessionOverflows.clear();
  }
}

export const overflowMonitor = new OverflowMonitor();
export default overflowMonitor;
