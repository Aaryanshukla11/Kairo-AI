import { Fingerprint } from './deduplicationTypes';

export class SemanticSimilarity {
  public computeSemanticSimilarity(f1: Fingerprint, f2: Fingerprint): number {
    const sig1 = f1.minHashes;
    const sig2 = f2.minHashes;

    if (!sig1 || !sig2 || sig1.length === 0 || sig2.length === 0) {
      return 0.0;
    }

    const len = Math.min(sig1.length, sig2.length);
    let matchCount = 0;

    for (let i = 0; i < len; i++) {
      if (sig1[i] === sig2[i] && sig1[i] !== Number.MAX_SAFE_INTEGER) {
        matchCount++;
      }
    }

    return matchCount / len;
  }
}

export const semanticSimilarity = new SemanticSimilarity();
export default semanticSimilarity;
