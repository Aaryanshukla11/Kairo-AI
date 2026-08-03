import { TokenizerArtifact } from './tokenizerTypes';

export class TokenizerCompatibility {
  public checkCompatibility(
    artifact: TokenizerArtifact,
    texts: string[]
  ): { isCompatible: boolean; coveredRatio: number; warnings: string[] } {
    const warnings: string[] = [];
    const vocab = artifact.vocab;

    let totalChars = 0;
    let coveredChars = 0;

    texts.forEach(text => {
      for (const char of text) {
        totalChars++;
        if (char in vocab) {
          coveredChars++;
        }
      }
    });

    const coveredRatio = totalChars > 0 ? parseFloat((coveredChars / totalChars).toFixed(4)) : 1.0;

    if (coveredRatio < 0.90) {
      warnings.push(`Low character coverage: Only ${(coveredRatio * 100).toFixed(1)}% of characters in texts are represented in the vocabulary.`);
    }

    return {
      isCompatible: coveredRatio >= 0.80,
      coveredRatio,
      warnings
    };
  }
}

export const tokenizerCompatibility = new TokenizerCompatibility();
export default tokenizerCompatibility;
