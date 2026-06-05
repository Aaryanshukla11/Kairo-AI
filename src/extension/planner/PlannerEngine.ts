import { Plan, PlanFactory, PlanValidator, PlanStep, ActionType, RiskLevel } from '../../common/planner';
import { randomUUID } from 'crypto';

export class PlannerEngine {
  /**
   * Generates execution plan metadata for a prompt session.
   */
  public generatePlan(sessionId: string, promptId: string, promptText: string, _contextSnapshot: any): Plan {
    const steps: PlanStep[] = [];
    const cleanPrompt = (promptText || '').trim();

    steps.push({
      stepId: randomUUID(),
      title: 'Analyze request & workspace context',
      description: `Evaluate requirements for: "${cleanPrompt.substring(0, 50)}"`,
      actionType: ActionType.READ_FILE,
      target: 'workspace',
      status: 'PENDING',
      futureDependencies: [],
      estimatedDuration: 1000
    });

    const plan = PlanFactory.create(
      sessionId,
      promptId,
      `Plan for: ${cleanPrompt.substring(0, 30)}...`,
      steps,
      RiskLevel.LOW,
      true
    );

    const validation = PlanValidator.validate(plan);
    if (!validation.valid) {
      throw new Error(`Plan validation failed: ${validation.errors.join(', ')}`);
    }

    return plan;
  }
}
