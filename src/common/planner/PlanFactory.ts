import { Plan } from './Plan';
import { PlanStatus } from './PlanStatus';
import { RiskLevel } from './RiskLevel';
import { PlanStep } from './PlanStep';
import { PlanMetadata } from './PlanMetadata';
import { randomUUID } from 'crypto';

export class PlanFactory {
  /**
   * Generates a frozen Plan instance.
   */
  public static create(
    sessionId: string,
    promptId: string,
    summary: string,
    steps: PlanStep[],
    riskLevel: RiskLevel = RiskLevel.LOW,
    approvalRequired: boolean = true
  ): Plan {
    
    let estimatedDuration = 0;
    for (const step of steps) {
      estimatedDuration += step.estimatedDuration;
    }

    const plan: Plan = {
      id: randomUUID(),
      sessionId,
      promptId,
      createdAt: Date.now(),
      status: PlanStatus.CREATED,
      summary,
      estimatedSteps: steps.length,
      estimatedDuration,
      riskLevel,
      approvalRequired,
      steps,
      metadata: {
        generatedAt: Date.now(),
        engineVersion: '1.0.0',
        autoExecutable: !approvalRequired,
        requiresReview: approvalRequired
      }
    };

    return Object.freeze(plan);
  }
}
