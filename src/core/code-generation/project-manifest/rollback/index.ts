import { IRollbackCheckpoint, IExecutionStep } from '../schema';

export class RollbackPlanner {
  public generateCheckpoints(steps: IExecutionStep[]): IRollbackCheckpoint[] {
    const checkpoints: IRollbackCheckpoint[] = [];

    for (const s of steps) {
      if (s.failureAction === 'ROLLBACK' || s.failureAction === 'ABORT') {
        checkpoints.push({
          checkpointId: `chk-${s.generatorId.toLowerCase()}`,
          stageName: s.stageName,
          recoveryActions: [
            `Remove generated files assigned to ${s.generatorId}`,
            `Restore git index cache state`
          ]
        });
      }
    }

    return checkpoints;
  }
}

export const rollbackPlanner = new RollbackPlanner();
export default rollbackPlanner;
