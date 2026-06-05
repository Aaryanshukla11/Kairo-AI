export class CodeReviewValidator {
  public reviewPatch(patchContent: string): { rating: number; violations: string[] } {
    const violations: string[] = [];
    if (patchContent.includes('eval(')) {
      violations.push('Security Alert: Attempted unsafe eval execution in validation parameters.');
    }
    return {
      rating: violations.length === 0 ? 100 : 60,
      violations
    };
  }
}

export const codeReviewValidator = new CodeReviewValidator();
