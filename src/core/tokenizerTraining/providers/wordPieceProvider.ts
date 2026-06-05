import { TokenizerConfig } from '../tokenizerTypes';

export class WordPieceProvider {
  public train(texts: string[], config: TokenizerConfig): { vocab: Record<string, number>; mergeRules: string[] } {
    const vocab: Record<string, number> = {};
    const mergeRules: string[] = [];

    config.specialTokens.forEach((tok, idx) => {
      vocab[tok] = idx;
    });

    let currentId = config.specialTokens.length;

    // WordPiece uses ## prefix for subwords
    const uniqueChars = new Set<string>();
    const subwordsCount: Record<string, number> = {};

    texts.forEach(text => {
      text.split(/\s+/).forEach(w => {
        if (!w) return;
        uniqueChars.add(w[0]);
        for (let i = 1; i < w.length; i++) {
          const sub = '##' + w[i];
          subwordsCount[sub] = (subwordsCount[sub] || 0) + 1;
        }
      });
    });

    uniqueChars.forEach(char => {
      if (currentId < config.vocabSize && !(char in vocab)) {
        vocab[char] = currentId++;
      }
    });

    const sortedSubwords = Object.entries(subwordsCount).sort((a, b) => b[1] - a[1]);
    for (const [sub] of sortedSubwords) {
      if (currentId >= config.vocabSize) break;
      if (!(sub in vocab)) {
        vocab[sub] = currentId++;
      }
    }

    return { vocab, mergeRules };
  }
}

export const wordPieceProvider = new WordPieceProvider();
export default wordPieceProvider;
