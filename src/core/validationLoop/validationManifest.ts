import { ValidationReportModel, ValidationManifest } from './validationTypes';
import * as crypto from 'crypto';

export class ValidationManifestManager {
  public createManifest(report: ValidationReportModel): ValidationManifest {
    const manifestId = `MAN-VAL-${report.reportId}-${Date.now()}`;
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

export const validationManifest = new ValidationManifestManager();
export default validationManifest;
