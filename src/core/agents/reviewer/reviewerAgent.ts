import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { ReviewerEventType } from './reviewerTypes';
import { reviewValidator } from './reviewValidator';
import { reviewerBrain } from './reviewerBrain';
import { reviewerMetrics } from './reviewerMetrics';
import { ReviewerEvents } from './reviewerEvents';

export class ReviewerAgent extends BaseAgent {
  private events = new ReviewerEvents();

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  /**
   * Main entry point to review compiled plans.
   */
  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    this.events.emit(ReviewerEventType.ReviewStarted, { taskId: task.id });

    try {
      const plan = task.payload.plan;
      
      reviewValidator.validatePlan(plan);

      const report = await reviewerBrain.reviewPlan(plan);

      if (report.warnings.length > 0) {
        this.events.emit(ReviewerEventType.IssueDetected, { warnings: report.warnings });
      }

      if (report.recommendations.length > 0) {
        this.events.emit(ReviewerEventType.RecommendationGenerated, { recommendations: report.recommendations });
      }

      reviewerMetrics.recordReviewRun(report.overallScore, report.warnings.length, report.recommendations.length);

      this.events.emit(ReviewerEventType.ReviewCompleted, { report });
      this.status = AgentStatus.Completed;

      return {
        success: true,
        report,
        metrics: reviewerMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(ReviewerEventType.ReviewFailed, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
