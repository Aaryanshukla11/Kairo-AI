import { EvaluationReportModel } from './evaluationTypes';
import * as crypto from 'crypto';

export class EvaluationManifest {
  public createManifest(report: EvaluationReportModel): string {
    const reportStr = JSON.stringify(report);
    return 'sha256-' + crypto.createHash('sha256').update(reportStr, 'utf8').digest('hex');
  }
}

export const evaluationManifest = new EvaluationManifest();
export default evaluationManifest;
