import { TokenizerArtifact, TokenizerManifestModel } from './tokenizerTypes';

export class TokenizerRegistry {
  private artifacts = new Map<string, TokenizerArtifact>();
  private manifests = new Map<string, TokenizerManifestModel>();

  public registerTokenizer(artifact: TokenizerArtifact, manifest: TokenizerManifestModel): void {
    const key = `${artifact.datasetId}:${artifact.version}:${artifact.algorithm}`;
    
    // Immutability Check
    if (this.artifacts.has(key)) {
      throw new Error(`Versioning Error: Tokenizer [${artifact.algorithm}] version ${artifact.version} for dataset ${artifact.datasetId} already exists and is immutable.`);
    }

    this.artifacts.set(key, artifact);
    this.manifests.set(key, manifest);
  }

  public getTokenizer(datasetId: string, version: string, algorithm: string): TokenizerArtifact | undefined {
    return this.artifacts.get(`${datasetId}:${version}:${algorithm}`);
  }

  public getManifest(datasetId: string, version: string, algorithm: string): TokenizerManifestModel | undefined {
    return this.manifests.get(`${datasetId}:${version}:${algorithm}`);
  }

  public listTokenizers(): TokenizerArtifact[] {
    return Array.from(this.artifacts.values());
  }

  public clear(): void {
    this.artifacts.clear();
    this.manifests.clear();
  }
}

export const tokenizerRegistry = new TokenizerRegistry();
export default tokenizerRegistry;
