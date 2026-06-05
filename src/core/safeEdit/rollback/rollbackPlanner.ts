import { SafeEditInput } from '../safeEditTypes';
import { rollbackCertificateGenerator } from './rollbackCertificate';
import { RollbackReadinessCertificate } from './rollbackTypes';

export class RollbackPlanner {
  public generateCertificate(input: SafeEditInput): RollbackReadinessCertificate {
    const snapshots = input.targetFile ? [`snap-pre-${Date.now()}`] : [];
    return rollbackCertificateGenerator.generate(input.targetFile, snapshots);
  }
}
export const rollbackPlanner = new RollbackPlanner();
