import { OptimizerReportModel, OptimizerManifestModel } from './optimizerTypes';
import * as crypto from 'crypto';

export class OptimizerManifest {
  public createManifest(report: OptimizerReportModel): OptimizerManifestModel {
    const manifestId = `MAN-OPT-${report.reportId}-${Date.now()}`;
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

export const optimizerManifest = new OptimizerManifest();
export default optimizerManifest;
