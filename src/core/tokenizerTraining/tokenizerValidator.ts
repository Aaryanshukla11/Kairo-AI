import { TokenizerArtifact } from './tokenizerTypes';

export class TokenizerValidator {
  public validateTokenizer(
    artifact: TokenizerArtifact,
    sampleTexts: string[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Vocabulary Contiguous check
    const ids = Object.values(artifact.vocab);
    const sorted = [...ids].sort((a, b) => a - b);
    
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i) {
        errors.push(`Vocabulary Error: Contiguous range mismatch. Expected ID ${i}, found ${sorted[i]}.`);
        break;
      }
    }

    // 2. Special Tokens check
    const config = artifact.config;
    config.specialTokens.forEach(tok => {
      if (!(tok in artifact.vocab)) {
        errors.push(`Vocabulary Error: Special token [${tok}] is missing in trained vocabulary.`);
      }
    });

    // 3. Duplicate Tokens check
    const tokens = Object.keys(artifact.vocab);
    const uniqueTokens = new Set(tokens);
    if (uniqueTokens.size !== tokens.length) {
      errors.push('Vocabulary Error: Duplicate keys found in vocabulary map.');
    }

    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      errors.push('Vocabulary Error: Duplicate mapping indices found in vocabulary map.');
    }

    // 4. Round-trip Stable Encoding Check
    sampleTexts.forEach(text => {
      const encoded = this.mockEncode(text, artifact);
      const decoded = this.mockDecode(encoded, artifact);
      // Basic check: if decoded text is empty, it's unstable
      if (!decoded && text.trim().length > 0) {
        errors.push(`Stability Error: Round-trip tokenization failed on: ${text.substring(0, 30)}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public mockEncode(text: string, artifact: TokenizerArtifact): number[] {
    const vocab = artifact.vocab;
    const ids: number[] = [];

    // Simple forward greedy character match tokenization
    const sortedTokens = Object.keys(vocab).sort((a, b) => b.length - a.length);
    let remaining = text;

    while (remaining.length > 0) {
      let matched = false;
      for (const tok of sortedTokens) {
        if (remaining.startsWith(tok)) {
          ids.push(vocab[tok]);
          remaining = remaining.substring(tok.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Unknown token fallback (e.g. [UNK] or similar)
        const unkToken = artifact.config.specialTokens[0] || '[UNK]';
        ids.push(vocab[unkToken] || 0);
        remaining = remaining.substring(1);
      }
    }

    return ids;
  }

  public mockDecode(ids: number[], artifact: TokenizerArtifact): string {
    const reverseVocab: Record<number, string> = {};
    Object.entries(artifact.vocab).forEach(([tok, id]) => {
      reverseVocab[id] = tok;
    });

    return ids.map(id => reverseVocab[id] || '').join('');
  }
}

export const tokenizerValidator = new TokenizerValidator();
export default tokenizerValidator;
