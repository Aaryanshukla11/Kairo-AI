export class ReactReview {
  public name = 'ReactReviewRules';
  public check(content: string): boolean {
    return !content.includes('dangerouslySetInnerHTML');
  }
}

export const reactReview = new ReactReview();
