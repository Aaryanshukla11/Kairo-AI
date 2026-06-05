import { FineTuningReport, FineTuningManifest, FineTuningMethod } from './fineTuningTypes';
import * as crypto from 'crypto';

export class FineTuningManifestBuilder {
  public createManifest(
    report: FineTuningReport,
    method: FineTuningMethod,
    baseModelId: string,
    datasetVersion: string,
    tokenizerVersion: string,
    configChecksum: string
  ): FineTuningManifest {
    const serialized = JSON.stringify(report);
    const hash = crypto.createHash('sha256').update(serialized).digest('hex');

    return {
      sessionId: report.sessionId,
      method,
      baseModelId,
      datasetVersion,
      tokenizerVersion,
      configChecksum,
      checksum: `sha256-${hash}`,
      timestamp: Date.now()
    };
  }
}

export const fineTuningManifest = new FineTuningManifestBuilder();
export default fineTuningManifest;
