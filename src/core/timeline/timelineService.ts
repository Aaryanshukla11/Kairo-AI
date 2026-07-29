import { timelineEngine } from './timelineEngine';
import { Timeline, TimelineStepStatus } from './timelineTypes';
import { ExecutionPlan } from '../planner/types';

export class TimelineService {
  private activeTimeline: Timeline | null = null;

  /**
   * Initializes a timeline from an execution plan.
   */
  public initializeTimeline(plan: ExecutionPlan): Timeline {
    const timeline = timelineEngine.generateTimeline(plan);
    this.activeTimeline = timeline;
    return timeline;
  }

  /**
   * Retrieves the current active timeline.
   */
  public getActiveTimeline(): Timeline | null {
    return this.activeTimeline;
  }

  /**
   * Updates status of a timeline step and returns the updated timeline.
   */
  public updateStep(stepId: string, status: TimelineStepStatus): Timeline {
    if (!this.activeTimeline) {
      throw new Error('No active timeline found.');
    }
    const updated = timelineEngine.updateStepStatus(this.activeTimeline.id, stepId, status);
    this.activeTimeline = updated;
    return updated;
  }

  /**
   * Clears the current active timeline state.
   */
  public clearActiveTimeline(): void {
    this.activeTimeline = null;
  }
}

export const timelineService = new TimelineService();
