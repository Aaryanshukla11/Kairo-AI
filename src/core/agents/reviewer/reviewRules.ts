import { ExecutionPlan } from '../planner/plannerTypes';

export interface ViolationIssue {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ReviewRules {
  /**
   * Scans plans for rule violations like excessive deletes or massive edits.
   */
  public evaluate(plan: ExecutionPlan): ViolationIssue[] {
    const issues: ViolationIssue[] = [];

    if (plan.affectedFiles && plan.affectedFiles.length > 5) {
      issues.push({
        type: 'LargeFileEdits',
        description: `Plan edits a large number of files (${plan.affectedFiles.length}). This could lead to merge conflicts.`,
        severity: 'medium'
      });
    }

    if (plan.tasks.length > 8) {
      issues.push({
        type: 'MassiveRefactors',
        description: 'Plan contains a large number of task steps. Consider splitting into multiple sub-milestones.',
        severity: 'high'
      });
    }

    for (const task of plan.tasks) {
      if (task.type === 'Delete' || task.title.toLowerCase().includes('delete')) {
        issues.push({
          type: 'UnsafeFileDeletion',
          description: `Task "${task.id}" plans to delete resources. Validate backup checkpoints first.`,
          severity: 'high'
        });
      }
    }

    return issues;
  }
}

export const reviewRules = new ReviewRules();
