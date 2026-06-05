import { PrecisionPolicy, LossScalingReport, LossScalingMode } from './precisionTypes';

interface ScaleState {
  mode: LossScalingMode;
  currentScale: number;
  minScale: number;
  maxScale: number;
  growthFactor: number;
  backoffFactor: number;
  hysteresis: number;
  consecutiveNormalSteps: number;
  consecutiveOverflowSteps: number;
  lastAdjustmentStep: number;
}

export class LossScalingManager {
  private sessionScales: Map<string, ScaleState> = new Map();

  public configure(sessionId: string, policy: PrecisionPolicy): void {
    const mode = policy.lossScalingMode;
    const initialScale = policy.initialScale;
    const minScale = policy.minScale;
    const maxScale = policy.maxScale;
    const growthFactor = policy.growthFactor ?? 2.0;
    const backoffFactor = policy.backoffFactor ?? 0.5;
    const hysteresis = policy.hysteresis ?? 1000;

    this.sessionScales.set(sessionId, {
      mode,
      currentScale: initialScale,
      minScale,
      maxScale,
      growthFactor,
      backoffFactor,
      hysteresis,
      consecutiveNormalSteps: 0,
      consecutiveOverflowSteps: 0,
      lastAdjustmentStep: 0
    });
  }

  public adjustScale(sessionId: string, hasOverflow: boolean, currentStep: number): number {
    const state = this.sessionScales.get(sessionId);
    if (!state) {
      // Return default scale 1.0 if not configured
      return 1.0;
    }

    if (state.mode === 'static' || state.mode === 'framework') {
      // Static scales do not change dynamically
      return state.currentScale;
    }

    // Dynamic and Automatic scaling updates
    if (hasOverflow) {
      state.consecutiveOverflowSteps++;
      state.consecutiveNormalSteps = 0;

      // Immediately back off scale upon overflow
      const nextScale = Math.max(state.minScale, state.currentScale * state.backoffFactor);
      if (nextScale !== state.currentScale) {
        state.currentScale = nextScale;
        state.lastAdjustmentStep = currentStep;
      }
    } else {
      state.consecutiveNormalSteps++;
      state.consecutiveOverflowSteps = 0;

      // Increase scale if training is stable for 'hysteresis' steps
      if (state.consecutiveNormalSteps >= state.hysteresis) {
        const nextScale = Math.min(state.maxScale, state.currentScale * state.growthFactor);
        if (nextScale !== state.currentScale) {
          state.currentScale = nextScale;
          state.lastAdjustmentStep = currentStep;
        }
        // Reset normal counter after increasing
        state.consecutiveNormalSteps = 0;
      }
    }

    return state.currentScale;
  }

  public getScalingReport(sessionId: string): LossScalingReport {
    const state = this.sessionScales.get(sessionId);
    if (!state) {
      return {
        mode: 'static',
        currentScale: 1.0,
        consecutiveNormalSteps: 0,
        consecutiveOverflowSteps: 0,
        lastAdjustmentStep: 0
      };
    }

    return {
      mode: state.mode,
      currentScale: state.currentScale,
      consecutiveNormalSteps: state.consecutiveNormalSteps,
      consecutiveOverflowSteps: state.consecutiveOverflowSteps,
      lastAdjustmentStep: state.lastAdjustmentStep
    };
  }

  public clearSession(sessionId: string): void {
    this.sessionScales.delete(sessionId);
  }

  public clearAll(): void {
    this.sessionScales.clear();
  }
}

export const lossScalingManager = new LossScalingManager();
export default lossScalingManager;
