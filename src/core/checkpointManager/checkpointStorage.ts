import { CheckpointModel } from './checkpointTypes';
import { localStorageProvider, filesystemProvider, artifactRegistryProvider, compressedStorageProvider } from './providers';

export class CheckpointStorage {
  public saveCheckpoint(checkpoint: CheckpointModel): void {
    // 1. Compress
    const compressed = compressedStorageProvider.compress(checkpoint);
    
    // 2. Save in local storage
    localStorageProvider.save(compressed);

    // 3. Write mock binary representation to mock filesystem
    const path = `/checkpoints/${checkpoint.checkpointId}.bin`;
    filesystemProvider.writeFile(path, JSON.stringify(compressed));

    // 4. Push to remote artifact registry
    artifactRegistryProvider.pushArtifact(compressed);
  }

  public loadCheckpoint(checkpointId: string): CheckpointModel | undefined {
    // Attempt local storage pull
    const local = localStorageProvider.read(checkpointId);
    if (local) {
      return compressedStorageProvider.decompress(local);
    }

    // Try remote pull
    const remote = artifactRegistryProvider.pullArtifact(checkpointId);
    if (remote) {
      localStorageProvider.save(remote);
      return compressedStorageProvider.decompress(remote);
    }

    return undefined;
  }

  public deleteCheckpoint(checkpointId: string): void {
    localStorageProvider.delete(checkpointId);
    filesystemProvider.deleteFile(`/checkpoints/${checkpointId}.bin`);
  }

  public listAllStorage(): CheckpointModel[] {
    return localStorageProvider.list();
  }

  public clear(): void {
    localStorageProvider.clear();
    filesystemProvider.clear();
    artifactRegistryProvider.clear();
  }
}

export const checkpointStorage = new CheckpointStorage();
export default checkpointStorage;
