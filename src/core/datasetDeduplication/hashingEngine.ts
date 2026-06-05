import * as crypto from 'crypto';

export class HashingEngine {
  public computeExactHash(content: string): string {
    if (!content) return 'empty';
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  public computeStructuralHash(tokens: string[]): string {
    if (!tokens || tokens.length === 0) return 'empty';
    // Structural hash combines token types or identifiers to make a fingerprint
    const tokenSummary = tokens.join('|');
    return crypto.createHash('md5').update(tokenSummary, 'utf8').digest('hex');
  }
}

export const hashingEngine = new HashingEngine();
export default hashingEngine;
