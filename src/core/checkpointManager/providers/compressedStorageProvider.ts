import { CheckpointModel } from '../checkpointTypes';

export class CompressedStorageProvider {
  public compress(checkpoint: CheckpointModel): CheckpointModel {
    return {
      ...checkpoint,
      isCompressed: true
    };
  }

  public decompress(checkpoint: CheckpointModel): CheckpointModel {
    return {
      ...checkpoint,
      isCompressed: false
    };
  }
}

export const compressedStorageProvider = new CompressedStorageProvider();
export default compressedStorageProvider;
