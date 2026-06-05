import { CheckpointModel, CheckpointManifestModel } from './checkpointTypes';

export class CheckpointManifest {
  public createManifest(checkpoint: CheckpointModel): CheckpointManifestModel {
    const manifestId = `MAN-CHK-${checkpoint.checkpointId}-${Date.now()}`;
    const fileList = [
      `/checkpoints/${checkpoint.checkpointId}.bin`,
      `/checkpoints/${checkpoint.checkpointId}_meta.json`
    ];

    return {
      manifestId,
      checkpointId: checkpoint.checkpointId,
      checksum: checkpoint.checksum,
      fileList,
      createdAt: Date.now()
    };
  }
}

export const checkpointManifest = new CheckpointManifest();
export default checkpointManifest;
