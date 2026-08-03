import { TokenizerConfig } from '../tokenizerTypes';

export class SentencePieceProvider {
  public train(texts: string[], config: TokenizerConfig): { vocab: Record<string, number>; mergeRules: string[] } {
    const vocab: Record<string, number> = {};
    const mergeRules: string[] = [];

    // Add special tokens first
    config.specialTokens.forEach((tok, idx) => {
      vocab[tok] = idx;
    });

    // Extract character/subword tokens from corpus
    let currentId = config.specialTokens.length;
    const charCount: Record<string, number> = {};

    texts.forEach(t => {
      // SentencePiece prepends whitespace with a special char (e.g. 9601 / ' ')
      const normalized = ' ' + t.replace(/\s+/g, ' ');
      for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        charCount[char] = (charCount[char] || 0) + 1;
      }
    });

    // Sort by count descending and take up to vocabSize limits
    const sorted = Object.entries(charCount).sort((a, b) => b[1] - a[1]);
    for (const [char] of sorted) {
      if (currentId >= config.vocabSize) break;
      if (!(char in vocab)) {
        vocab[char] = currentId++;
      }
    }

    return { vocab, mergeRules };
  }
}

export const sentencePieceProvider = new SentencePieceProvider();
export default sentencePieceProvider;
