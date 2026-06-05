import * as crypto from 'crypto';

export class ArtifactIntegrity {
  public verifyChecksum(data: string, expectedHash: string): boolean {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash === expectedHash;
  }
}

export const artifactIntegrity = new ArtifactIntegrity();
