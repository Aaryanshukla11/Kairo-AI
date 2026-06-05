import { GradientReportModel, GradientManifestModel } from './gradientTypes';
import * as crypto from 'crypto';

export class GradientManifest {
  public createManifest(report: GradientReportModel): GradientManifestModel {
    const manifestId = `MAN-GRAD-${report.reportId}-${Date.now()}`;
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

export const gradientManifest = new GradientManifest();
export default gradientManifest;
