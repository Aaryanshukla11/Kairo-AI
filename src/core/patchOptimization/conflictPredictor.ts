import { PatchOp } from './patchAnalyzer';

export class ConflictPredictor {
  public predictRisk(ops: PatchOp[]): 'low' | 'medium' | 'high' {
    if (ops.length > 5) {
      return 'high';
    }
    if (ops.length > 2) {
      return 'medium';
    }
    return 'low';
  }
}

export const conflictPredictor = new ConflictPredictor();
