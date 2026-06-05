export interface ReviewMetricsData {
  totalReviews: number;
  totalIssuesFound: number;
}

export class ReviewMetrics {
  private data: ReviewMetricsData = {
    totalReviews: 0,
    totalIssuesFound: 0
  };

  public record(issuesCount: number): void {
    this.data.totalReviews++;
    this.data.totalIssuesFound += issuesCount;
  }

  public getMetrics(): ReviewMetricsData {
    return this.data;
  }
}

export const reviewMetrics = new ReviewMetrics();
