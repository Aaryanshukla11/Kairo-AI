import { Fingerprint } from './deduplicationTypes';

export class StructuralSimilarity {
  public computeStructuralSimilarity(f1: Fingerprint, f2: Fingerprint): number {
    // 1. If structural hashes match exactly, similarity is 1.0
    if (f1.structuralHash === f2.structuralHash && f1.structuralHash !== 'empty') {
      return 1.0;
    }

    // 2. Otherwise, check minhash similarity as a fallback or return 0
    return 0.0;
  }
}

export const structuralSimilarity = new StructuralSimilarity();
export default structuralSimilarity;
