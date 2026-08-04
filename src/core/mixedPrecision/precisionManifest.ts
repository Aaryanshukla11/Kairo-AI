import { PrecisionReport, PrecisionManifest } from './precisionTypes';
import * as crypto from 'crypto';

export class PrecisionManifestManager {
  public createManifest(report: PrecisionReport): PrecisionManifest {
    const manifestId = `MAN-PREC-${report.reportId}-${Date.now()}`;
    const serialized = JSON.stringify(report);
    const checksum = 'sha256-' + crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');

    return {
      manifestId,
      sessionId: report.sessionId,
      checksum,
      createdAt: Date.now()
    };
  }
}

export const precisionManifest = new PrecisionManifestManager();
export default precisionManifest;
