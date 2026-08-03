import { TokenizerArtifact, EvaluationReportModel } from './tokenizerTypes';
import { tokenizerValidator } from './tokenizerValidator';

export class TokenizerEvaluator {
  public runEvaluation(
    artifact: TokenizerArtifact,
    texts: string[]
  ): EvaluationReportModel {
    const runId = `EVAL-${artifact.artifactId}-${Date.now()}`;
    const validation = tokenizerValidator.validateTokenizer(artifact, texts);

    // Stability verification
    let isEncodingStable = true;
    let isDecodingStable = true;

    try {
      for (const text of texts) {
        const ids = tokenizerValidator.mockEncode(text, artifact);
        const decoded = tokenizerValidator.mockDecode(ids, artifact);
        if (!decoded && text.trim().length > 0) {
          isEncodingStable = false;
          isDecodingStable = false;
        }
      }
    } catch {
      isEncodingStable = false;
      isDecodingStable = false;
    }

    return {
      runId,
      artifactId: artifact.artifactId,
      isVocabComplete: validation.isValid,
      areSpecialTokensValid: !validation.errors.some(e => e.includes('Special')),
      noDuplicateTokens: !validation.errors.some(e => e.includes('Duplicate')),
      isEncodingStable,
      isDecodingStable,
      errors: validation.errors
    };
  }
}

export const tokenizerEvaluator = new TokenizerEvaluator();
export default tokenizerEvaluator;
