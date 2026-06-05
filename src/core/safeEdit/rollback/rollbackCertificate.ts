import { RollbackReadinessCertificate } from './rollbackTypes';
import { rollbackGraph } from './rollbackGraph';
import { rollbackVerifier } from './rollbackVerifier';

export class RollbackCertificateGenerator {
  public generate(targetFile: string, snapshots: string[]): RollbackReadinessCertificate {
    const affected = targetFile ? [targetFile] : [];
    const isVerified = rollbackVerifier.verifySnapshots(snapshots);

    return {
      certificateId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      affectedFiles: affected,
      affectedSymbols: [],
      snapshots,
      recoveryOrder: rollbackGraph.sortRecoveryOrder(affected),
      dependencies: [],
      estimatedRollbackTimeMs: affected.length * 150 + 50,
      rollbackConfidence: isVerified ? 0.98 : 0.4,
      verificationResult: isVerified ? 'Success' : 'Failed',
      timestamp: Date.now()
    };
  }
}
export const rollbackCertificateGenerator = new RollbackCertificateGenerator();
