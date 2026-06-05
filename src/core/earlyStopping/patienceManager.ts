import { PatienceReport } from './stoppingTypes';

interface PatienceState {
  bestScore: number;
  stepsSinceImprovement: number;
  improvementCount: number;
  plateauLength: number;
  lastImprovementStep: number;
  historyScores: number[];
}

export class PatienceManager {
  private states: Map<string, Map<string, PatienceState>> = new Map();

  public getOrCreateState(
    sessionId: string,
    metricName: string,
    initialBestValue: number
  ): PatienceState {
    let sessionStates = this.states.get(sessionId);
    if (!sessionStates) {
      sessionStates = new Map();
      this.states.set(sessionId, sessionStates);
    }

    let state = sessionStates.get(metricName);
    if (!state) {
      state = {
        bestScore: initialBestValue,
        stepsSinceImprovement: 0,
        improvementCount: 0,
        plateauLength: 0,
        lastImprovementStep: 0,
        historyScores: [initialBestValue]
      };
      sessionStates.set(metricName, state);
    }
    return state;
  }

  public updateState(
    sessionId: string,
    metricName: string,
    currentValue: number,
    currentStep: number,
    hasImproved: boolean,
    _mode: 'min' | 'max'
  ): PatienceState {
    const state = this.getOrCreateState(sessionId, metricName, currentValue);

    state.historyScores.push(currentValue);
    if (state.historyScores.length > 50) {
      state.historyScores.shift();
    }

    if (hasImproved) {
      state.bestScore = currentValue;
      state.stepsSinceImprovement = 0;
      state.improvementCount += 1;
      state.plateauLength = 0;
      state.lastImprovementStep = currentStep;
    } else {
      state.stepsSinceImprovement += 1;
      state.plateauLength += 1;
    }

    return state;
  }

  public calculateReport(
    sessionId: string,
    metricName: string,
    patienceWindow: number
  ): PatienceReport {
    const sessionStates = this.states.get(sessionId);
    const state = sessionStates?.get(metricName) || {
      bestScore: 0,
      stepsSinceImprovement: 0,
      improvementCount: 0,
      plateauLength: 0,
      lastImprovementStep: 0,
      historyScores: []
    };

    // Calculate stability (standard deviation of the last 5 runs)
    let stability = 0;
    const scores = state.historyScores;
    if (scores.length > 1) {
      const recent = scores.slice(-5);
      const mean = recent.reduce((sum, v) => sum + v, 0) / recent.length;
      const variance = recent.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recent.length;
      stability = parseFloat(Math.sqrt(variance).toFixed(6));
    }

    return {
      patienceWindow,
      improvementCount: state.improvementCount,
      plateauLength: state.plateauLength,
      metricStability: stability,
      bestScore: state.bestScore,
      lastImprovementStep: state.lastImprovementStep
    };
  }

  public clearSession(sessionId: string): void {
    this.states.delete(sessionId);
  }

  public clearAll(): void {
    this.states.clear();
  }
}

export const patienceManager = new PatienceManager();
export default patienceManager;
