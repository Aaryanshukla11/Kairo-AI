import { TokenizerConfig, TokenizerArtifact } from './tokenizerTypes';

export class TokenizerBuilder {
  public buildArtifact(
    datasetId: string,
    version: string,
    algorithm: string,
    vocab: Record<string, number>,
    mergeRules: string[],
    config: TokenizerConfig
  ): TokenizerArtifact {
    const artifactId = `TOK-${datasetId}-${algorithm}-${version}-${Date.now()}`;

    return {
      artifactId,
      datasetId,
      version,
      algorithm,
      vocab: { ...vocab },
      mergeRules: [...mergeRules],
      config: { ...config },
      createdAt: Date.now()
    };
  }
}

export const tokenizerBuilder = new TokenizerBuilder();
export default tokenizerBuilder;
