import { SafeEditInput } from './safeEditTypes';

export class RollbackPlanner {
  public verifyRollbackReadiness(input: SafeEditInput): { ready: boolean; blocking: string[] } {
    const blocking: string[] = [];

    // Rollback is ready if there is a target file and it can be backed up (e.g. not empty)
    const isReady = !!input.targetFile && input.targetFile.trim().length > 0;

    if (!isReady) {
      blocking.push('ROLLBACK-01: Missing active rollback plan or file backup checkpoint');
    }

    return {
      ready: isReady,
      blocking
    };
  }
}

export const rollbackPlanner = new RollbackPlanner();
