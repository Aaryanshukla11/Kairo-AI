import { ExperimentModel, ExperimentManifestModel } from './experimentTypes';
import * as crypto from 'crypto';

export class ExperimentManifest {
  public createManifest(experiment: ExperimentModel): ExperimentManifestModel {
    const manifestId = `MAN-EXP-${experiment.experimentId}-${Date.now()}`;
    const artifactHashes: Record<string, string> = {};

    experiment.artifacts.forEach(path => {
      artifactHashes[path] = 'sha256-' + crypto.createHash('sha256').update(path, 'utf8').digest('hex');
    });

    const serializedExp = JSON.stringify(experiment);
    const checksum = 'sha256-' + crypto.createHash('sha256').update(serializedExp, 'utf8').digest('hex');

    return {
      manifestId,
      experimentId: experiment.experimentId,
      version: experiment.version,
      checksum,
      artifactHashes,
      createdAt: Date.now()
    };
  }
}

export const experimentManifest = new ExperimentManifest();
export default experimentManifest;
