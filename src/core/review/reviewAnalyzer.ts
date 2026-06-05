export class ReviewAnalyzer {
  public analyzeStructure(content: string): { hasFormattingIssues: boolean } {
    return {
      hasFormattingIssues: content.includes('\r\n')
    };
  }
}

export const reviewAnalyzer = new ReviewAnalyzer();
