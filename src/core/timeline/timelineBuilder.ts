import { Timeline, TimelineStep, TimelineStepStatus } from './timelineTypes';

export class TimelineBuilder {
  private steps: TimelineStep[] = [];
  private currentStepNumber = 1;

  constructor(private readonly timelineId: string, private readonly planId: string) {}

  /**
   * Adds a step to the timeline, auto-incrementing the stepNumber.
   */
  public addStep(step: Omit<TimelineStep, 'stepNumber'>): this {
    this.steps.push({
      ...step,
      stepNumber: this.currentStepNumber++
    });
    return this;
  }

  /**
   * Builds and returns the final Timeline object.
   */
  public build(): Timeline {
    return {
      id: this.timelineId,
      planId: this.planId,
      steps: this.steps
    };
  }
}
