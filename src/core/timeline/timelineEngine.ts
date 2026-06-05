import { ExecutionPlan } from '../planner/types';
import { Timeline, TimelineStepStatus } from './timelineTypes';
import { TimelineBuilder } from './timelineBuilder';

export class TimelineEngine {
  private timelines: Map<string, Timeline> = new Map();

  /**
   * Generates a Timeline from a valid ExecutionPlan.
   * Throws an error if the plan or its tasks are invalid.
   */
  public generateTimeline(plan: ExecutionPlan): Timeline {
    if (!plan) {
      throw new Error('Timeline cannot exist without a valid plan.');
    }
    if (!plan.id) {
      throw new Error('Execution plan is missing an id.');
    }
    if (!plan.tasks || plan.tasks.length === 0) {
      throw new Error('Execution plan must contain at least one step.');
    }

    const timelineId = `timeline-${plan.id}`;
    const builder = new TimelineBuilder(timelineId, plan.id);

    for (const task of plan.tasks) {
      if (!task.id) {
        throw new Error('Every step in the plan requires a valid id.');
      }
      if (!task.title) {
        throw new Error('Every step in the plan requires a valid title.');
      }

      // Map TaskStatus to TimelineStepStatus
      let initialStatus = TimelineStepStatus.Waiting;
      if (task.status === 'Completed') {
        initialStatus = TimelineStepStatus.Completed;
      } else if (task.status === 'Running') {
        initialStatus = TimelineStepStatus.Running;
      } else if (task.status === 'Failed') {
        initialStatus = TimelineStepStatus.Failed;
      }

      const icon = this.getIconForTitle(task.title);

      builder.addStep({
        id: task.id,
        title: task.title,
        description: task.description,
        status: initialStatus,
        estimatedTime: task.estimatedTime || '1m',
        icon
      });
    }

    const timeline = builder.build();
    this.timelines.set(timeline.id, timeline);
    return timeline;
  }

  /**
   * Retrieves a cached timeline by ID.
   */
  public getTimeline(timelineId: string): Timeline | undefined {
    return this.timelines.get(timelineId);
  }

  /**
   * Updates the status of a step in a specific timeline.
   */
  public updateStepStatus(timelineId: string, stepId: string, status: TimelineStepStatus): Timeline {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error(`Timeline with ID ${timelineId} not found.`);
    }

    const step = timeline.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with ID ${stepId} not found in timeline ${timelineId}.`);
    }

    step.status = status;
    return timeline;
  }

  /**
   * Dynamically assigns appropriate VS Code octicons/names based on step titles.
   */
  private getIconForTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('analyze') || lowerTitle.includes('scan') || lowerTitle.includes('workspace')) {
      return 'search';
    }
    if (lowerTitle.includes('create') || lowerTitle.includes('scaffold') || lowerTitle.includes('component')) {
      return 'code';
    }
    if (lowerTitle.includes('route') || lowerTitle.includes('style') || lowerTitle.includes('update')) {
      return 'git-merge';
    }
    if (lowerTitle.includes('verify') || lowerTitle.includes('build') || lowerTitle.includes('test')) {
      return 'terminal';
    }
    if (lowerTitle.includes('complete') || lowerTitle.includes('finish')) {
      return 'check-all';
    }
    return 'gear';
  }
}

export const timelineEngine = new TimelineEngine();
