import { TokenizerArtifact } from './tokenizerTypes';

export class TokenizerMetadata {
  public getSummaryMetadata(artifact: TokenizerArtifact) {
    return {
      vocabSize: Object.keys(artifact.vocab).length,
      specialTokensCount: artifact.config.specialTokens.length,
      algorithmUsed: artifact.algorithm,
      datasetLineage: artifact.datasetId,
      version: artifact.version,
      timestamp: artifact.createdAt
    };
  }
}

export const tokenizerMetadata = new TokenizerMetadata();
export default tokenizerMetadata;
