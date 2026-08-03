import { TokenizerConfig } from '../tokenizerTypes';

export class UnigramProvider {
  public train(texts: string[], config: TokenizerConfig): { vocab: Record<string, number>; mergeRules: string[] } {
    const vocab: Record<string, number> = {};
    const mergeRules: string[] = [];

    config.specialTokens.forEach((tok, idx) => {
      vocab[tok] = idx;
    });

    let currentId = config.specialTokens.length;

    // Unigram starts with large vocab and iteratively removes low probability tokens
    // We mock this by collecting common subwords
    const candidates = new Set<string>();
    texts.forEach(text => {
      text.split(/\s+/).forEach(word => {
        for (let len = 1; len <= Math.min(word.length, 5); len++) {
          for (let i = 0; i <= word.length - len; i++) {
            candidates.add(word.substring(i, i + len));
          }
        }
      });
    });

    Array.from(candidates).slice(0, config.vocabSize - currentId).forEach(subword => {
      if (!(subword in vocab)) {
        vocab[subword] = currentId++;
      }
    });

    return { vocab, mergeRules };
  }
}

export const unigramProvider = new UnigramProvider();
export default unigramProvider;
