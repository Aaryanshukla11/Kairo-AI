import { TokenizerConfig } from './tokenizerTypes';
import { sentencePieceProvider, huggingFaceProvider, bpeProvider, unigramProvider, wordPieceProvider } from './providers';

export class TokenizerTrainer {
  public trainTokenizer(
    texts: string[],
    config: TokenizerConfig
  ): { vocab: Record<string, number>; mergeRules: string[] } {
    const algo = config.algorithm;

    switch (algo) {
      case 'SentencePiece':
        return sentencePieceProvider.train(texts, config);
      case 'BPE':
        return bpeProvider.train(texts, config);
      case 'Unigram':
        return unigramProvider.train(texts, config);
      case 'WordPiece':
        return wordPieceProvider.train(texts, config);
      default:
        return huggingFaceProvider.train(texts, config);
    }
  }
}

export const tokenizerTrainer = new TokenizerTrainer();
export default tokenizerTrainer;
