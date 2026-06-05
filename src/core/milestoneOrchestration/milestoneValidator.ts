import { MilestoneNode, MilestoneCheckpoint, MilestoneRecoveryPlan } from './milestoneTypes';
import { milestoneDependencyResolver } from './milestoneDependencyResolver';

export interface MilestoneValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class MilestoneValidator {
  validate(
    milestones: MilestoneNode[],
    executionOrder: string[],
    checkpoints: MilestoneCheckpoint[],
    recoveryPlans: MilestoneRecoveryPlan[]
  ): MilestoneValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Cycle detection
    const { hasCycles, cycles } = milestoneDependencyResolver.detectCycles(milestones);
    if (hasCycles) {
      errors.push(`Circular milestone dependencies detected: ${cycles.map(c => c.join(' ➔ ')).join(' | ')}`);
    }

    // 2. Complete task coverage check
    const milestoneIds = new Set(milestones.map(m => m.id));
    for (const m of milestones) {
      if (!m.tasks || m.tasks.length === 0) {
        warnings.push(`Milestone ${m.id} has no tasks assigned.`);
      }
      for (const depId of m.dependencies) {
        if (!milestoneIds.has(depId)) {
          errors.push(`Milestone ${m.id} depends on non-existent milestone ${depId}.`);
        }
      }
    }

    // 3. Valid checkpoints check
    for (const m of milestones) {
      const hasCheckpoint = checkpoints.some(cp => cp.milestoneId === m.id);
      if (!hasCheckpoint) {
        errors.push(`Milestone ${m.id} is missing a valid checkpoint configuration.`);
      }
    }

    // 4. Rollback path exists
    for (const m of milestones) {
      const hasRecovery = recoveryPlans.some(rec => rec.milestoneId === m.id);
      if (!hasRecovery) {
        errors.push(`Milestone ${m.id} is missing a rollback/recovery plan.`);
      }
      if (!m.rollbackBoundary) {
        warnings.push(`Milestone ${m.id} does not have an explicit rollback boundary string.`);
      }
    }

    // 5. Deterministic execution order check
    if (executionOrder.length !== milestones.length) {
      errors.push(`Execution order length (${executionOrder.length}) does not match milestone count (${milestones.length}).`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const milestoneValidator = new MilestoneValidator();
