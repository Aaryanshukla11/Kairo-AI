export interface ReviewerMetricsData {
  reviewsCount: number;
  averageOverallScore: number;
  totalWarningsDetected: number;
  totalRecommendationsGenerated: number;
}

export class ReviewerMetrics {
  private data: ReviewerMetricsData = {
    reviewsCount: 0,
    averageOverallScore: 0,
    totalWarningsDetected: 0,
    totalRecommendationsGenerated: 0
  };

  public recordReviewRun(overallScore: number, warningsCount: number, recsCount: number): void {
    const totalScore = (this.data.averageOverallScore * this.data.reviewsCount) + overallScore;
    this.data.reviewsCount++;
    this.data.totalWarningsDetected += warningsCount;
    this.data.totalRecommendationsGenerated += recsCount;
    this.data.averageOverallScore = totalScore / this.data.reviewsCount;
  }

  public getMetrics(): ReviewerMetricsData {
    return this.data;
  }
}

export const reviewerMetrics = new ReviewerMetrics();
