import { TokenizerManifestModel, TokenizerArtifact } from './tokenizerTypes';
import * as crypto from 'crypto';

export class TokenizerManifest {
  public createManifest(artifact: TokenizerArtifact): TokenizerManifestModel {
    const manifestId = `TOK-MAN-${artifact.artifactId}-${Date.now()}`;
    
    // Hash of serialized vocab index to serve as unique fingerprint checksum
    const vocabStr = JSON.stringify(artifact.vocab);
    const checksum = 'sha256-' + crypto.createHash('sha256').update(vocabStr, 'utf8').digest('hex');

    return {
      manifestId,
      artifactId: artifact.artifactId,
      datasetId: artifact.datasetId,
      version: artifact.version,
      vocabSize: Object.keys(artifact.vocab).length,
      checksum,
      createdAt: Date.now(),
      supportedAlgorithms: ['SentencePiece', 'BPE', 'Unigram', 'WordPiece']
    };
  }
}

export const tokenizerManifest = new TokenizerManifest();
export default tokenizerManifest;
