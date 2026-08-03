import { TokenizerConfig } from '../tokenizerTypes';

export class BpeProvider {
  public train(texts: string[], config: TokenizerConfig): { vocab: Record<string, number>; mergeRules: string[] } {
    const vocab: Record<string, number> = {};
    const mergeRules: string[] = [];

    // 1. Ingest Special tokens
    config.specialTokens.forEach((tok, idx) => {
      vocab[tok] = idx;
    });

    let currentId = config.specialTokens.length;

    // 2. Ingest characters
    const uniqueChars = new Set<string>();
    texts.forEach(t => {
      for (const char of t) {
        uniqueChars.add(char);
      }
    });

    uniqueChars.forEach(char => {
      if (currentId < config.vocabSize && !(char in vocab)) {
        vocab[char] = currentId++;
      }
    });

    // 3. Generate mock BPE merges (e.g. 't' + 'h' -> 'th')
    const words = texts.join(' ').split(/\s+/);
    const pairs: Record<string, number> = {};
    
    words.forEach(w => {
      for (let i = 0; i < w.length - 1; i++) {
        const pair = w[i] + ' ' + w[i+1];
        pairs[pair] = (pairs[pair] || 0) + 1;
      }
    });

    const sortedPairs = Object.entries(pairs).sort((a, b) => b[1] - a[1]);
    for (const [pair] of sortedPairs) {
      if (currentId >= config.vocabSize) break;
      const merged = pair.replace(' ', '');
      if (!(merged in vocab)) {
        vocab[merged] = currentId++;
        mergeRules.push(pair);
      }
    }

    return { vocab, mergeRules };
  }
}

export const bpeProvider = new BpeProvider();
export default bpeProvider;
