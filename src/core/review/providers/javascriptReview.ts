export class JavaScriptReview {
  public name = 'JavaScriptReviewRules';
  public check(content: string): boolean {
    return !content.includes('var ');
  }
}

export const javascriptReview = new JavaScriptReview();
