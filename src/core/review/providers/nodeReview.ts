export class NodeReview {
  public name = 'NodeReviewRules';
  public check(content: string): boolean {
    return !content.includes('eval(');
  }
}

export const nodeReview = new NodeReview();
