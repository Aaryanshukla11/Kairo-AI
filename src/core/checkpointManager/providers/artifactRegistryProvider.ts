import { CheckpointModel } from '../checkpointTypes';

export class ArtifactRegistryProvider {
  private remoteArtifacts = new Map<string, CheckpointModel>();

  public pushArtifact(checkpoint: CheckpointModel): void {
    this.remoteArtifacts.set(checkpoint.checkpointId, { ...checkpoint });
  }

  public pullArtifact(checkpointId: string): CheckpointModel | undefined {
    return this.remoteArtifacts.get(checkpointId);
  }

  public clear(): void {
    this.remoteArtifacts.clear();
  }
}

export const artifactRegistryProvider = new ArtifactRegistryProvider();
export default artifactRegistryProvider;
