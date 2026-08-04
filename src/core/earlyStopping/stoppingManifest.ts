import { StoppingReportModel, StoppingManifest } from './stoppingTypes';
import * as crypto from 'crypto';

export class StoppingManifestBuilder {
  public createManifest(report: StoppingReportModel): StoppingManifest {
    const serialized = JSON.stringify(report);
    const hash = crypto.createHash('sha256').update(serialized).digest('hex');

    return {
      reportId: report.reportId,
      checksum: `sha256-${hash}`,
      timestamp: Date.now()
    };
  }
}

export const stoppingManifest = new StoppingManifestBuilder();
export default stoppingManifest;
