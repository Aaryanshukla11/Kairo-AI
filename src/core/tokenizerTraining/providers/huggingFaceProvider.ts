import { TokenizerConfig } from '../tokenizerTypes';

export class HuggingFaceProvider {
  public train(texts: string[], config: TokenizerConfig): { vocab: Record<string, number>; mergeRules: string[] } {
    const vocab: Record<string, number> = {};
    const mergeRules: string[] = [];

    config.specialTokens.forEach((tok, idx) => {
      vocab[tok] = idx;
    });

    let currentId = config.specialTokens.length;
    // Basic word-based vocabulary extractor
    const wordCounts: Record<string, number> = {};
    texts.forEach(text => {
      text.split(/\s+/).forEach(w => {
        const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (clean) {
          wordCounts[clean] = (wordCounts[clean] || 0) + 1;
        }
      });
    });

    const sorted = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    for (const [word] of sorted) {
      if (currentId >= config.vocabSize) break;
      if (!(word in vocab)) {
        vocab[word] = currentId++;
      }
    }

    return { vocab, mergeRules };
  }
}

export const huggingFaceProvider = new HuggingFaceProvider();
export default huggingFaceProvider;
