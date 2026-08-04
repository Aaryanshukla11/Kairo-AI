import { TrainingSessionModel, TrainingManifestModel } from './trainingTypes';
import * as crypto from 'crypto';

export class TrainingManifest {
  public createManifest(session: TrainingSessionModel): TrainingManifestModel {
    const manifestId = `MAN-SESSION-${session.sessionId}-${Date.now()}`;
    const serialized = JSON.stringify(session);
    const checksum = 'sha256-' + crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');

    return {
      manifestId,
      sessionId: session.sessionId,
      checksum,
      createdAt: Date.now()
    };
  }
}

export const trainingManifest = new TrainingManifest();
export default trainingManifest;
