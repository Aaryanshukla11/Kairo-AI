import { CleanedSample, Fingerprint } from './deduplicationTypes';
import { hashingEngine } from './hashingEngine';
import { sourceCodeProvider, markdownProvider, jsonProvider, textProvider, documentationProvider } from './providers';

export class FingerprintGenerator {
  public generateFingerprint(sample: CleanedSample, kSize: number = 5, numHashes: number = 20): Fingerprint {
    const content = sample.content || '';
    const ext = sample.filePath.split('.').pop()?.toLowerCase() || '';

    // 1. Get tokens based on format
    let tokens: string[] = [];
    if (['ts', 'js', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'cs'].includes(ext)) {
      tokens = sourceCodeProvider.getCodeTokens(content);
    } else if (ext === 'md' || ext === 'markdown') {
      tokens = markdownProvider.getMarkdownTokens(content);
    } else if (ext === 'json' || ext === 'jsonl') {
      tokens = jsonProvider.getJsonTokens(content);
    } else if (['txt', 'rst', 'adoc'].includes(ext)) {
      tokens = textProvider.getTokens(content);
    } else {
      tokens = documentationProvider.getTokens(content);
    }

    // 2. Exact match hash
    const exactHash = hashingEngine.computeExactHash(content);

    // 3. Structural Hash
    const structuralHash = hashingEngine.computeStructuralHash(tokens);

    // 4. Semantic MinHash signatures
    const minHashes = this.computeMinHashes(tokens, kSize, numHashes);

    return {
      exactHash,
      structuralHash,
      minHashes
    };
  }

  public computeMinHashes(tokens: string[], kSize: number, numHashes: number): number[] {
    if (tokens.length === 0) {
      return Array(numHashes).fill(Number.MAX_SAFE_INTEGER);
    }

    // Create k-shingles (strings of sliding window k tokens)
    const shingles = new Set<string>();
    for (let i = 0; i <= tokens.length - kSize; i++) {
      shingles.add(tokens.slice(i, i + kSize).join(' '));
    }

    if (shingles.size === 0) {
      shingles.add(tokens.join(' '));
    }

    const minHashes: number[] = [];

    // Compute minhash values using family of simple hash functions
    for (let i = 0; i < numHashes; i++) {
      let minVal = Number.MAX_SAFE_INTEGER;
      
      for (const shingle of shingles) {
        // Hash shingle with parameters (seed index)
        const val = this.hashShingle(shingle, i);
        if (val < minVal) {
          minVal = val;
        }
      }
      minHashes.push(minVal);
    }

    return minHashes;
  }

  private hashShingle(shingle: string, seed: number): number {
    let hash = seed + 7;
    for (let i = 0; i < shingle.length; i++) {
      hash = (hash * 31 + shingle.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }
}

export const fingerprintGenerator = new FingerprintGenerator();
export default fingerprintGenerator;
