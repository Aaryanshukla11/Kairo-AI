export class TypeScriptReview {
  public name = 'TypeScriptReviewRules';
  public check(content: string): boolean {
    return !content.includes('as any');
  }
}

export const typescriptReview = new TypeScriptReview();
