import { ConvergenceStatus } from './lossTypes';

export class LossDiagnostics {
  public diagnose(status: ConvergenceStatus, currentLoss: number): string[] {
    const alerts: string[] = [];

    if (status === 'Divergence') {
      alerts.push('CRITICAL: Loss is diverging. Consider lowering learning rate or checking scale factors.');
    } else if (status === 'Plateau' && currentLoss > 1.0) {
      alerts.push('WARNING: Loss plateaued at a high value. Consider adjusting optimizer weight decays.');
    } else if (status === 'Slow convergence') {
      alerts.push('INFO: Slow convergence detected. Learning rate might be set too low.');
    }

    return alerts;
  }
}

export const lossDiagnostics = new LossDiagnostics();
export default lossDiagnostics;
