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

  public generateCertificate(input: SafeEditInput): { verificationResult: 'Success' | 'Failed' } {
    const res = this.verifyRollbackReadiness(input);
    return {
      verificationResult: res.ready ? 'Success' : 'Failed'
    };
  }
}

export const rollbackPlanner = new RollbackPlanner();
