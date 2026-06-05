import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { DatasetSnapshotModel } from './versionTypes';
import { snapshotProvider } from './providers/snapshotProvider';
import * as crypto from 'crypto';

export class DatasetSnapshot {
  public generateSnapshot(
    datasetId: string,
    version: string,
    samples: CleanedSample[]
  ): DatasetSnapshotModel {
    const snapshotId = `SNAP-${datasetId}-${version}-${Date.now()}`;
    
    // Compute total snapshot hash
    const sampleHashes = samples.map(s => s.provenance?.checksum || s.filePath).sort().join('|');
    const checksum = 'sha256-' + crypto.createHash('sha256').update(sampleHashes, 'utf8').digest('hex');

    const snapshot: DatasetSnapshotModel = {
      snapshotId,
      datasetId,
      version,
      timestamp: Date.now(),
      samples: samples.map(s => ({ ...s })), // Deep copy to maintain immutability
      checksum
    };

    snapshotProvider.saveSnapshot(snapshot);
    return snapshot;
  }

  public getSnapshot(snapshotId: string): DatasetSnapshotModel | undefined {
    return snapshotProvider.getSnapshot(snapshotId);
  }
}

export const datasetSnapshot = new DatasetSnapshot();
export default datasetSnapshot;
