import { Plan, PlanFactory, PlanValidator, PlanStep, ActionType, RiskLevel } from '../../common/planner';
import { randomUUID } from 'crypto';

export class PlannerEngine {
  /**
   * Mock generation of a Plan based on the prompt.
   * In the future, this will be the boundary to the offline LLM node.
   */
  public generatePlan(sessionId: string, promptId: string, promptText: string, _contextSnapshot: any): Plan {
    
    // Mock planner parsing logic matching the example
    const steps: PlanStep[] = [];
    
    if (promptText.toLowerCase().includes('login')) {
      steps.push({
        stepId: randomUUID(),
        title: 'Analyze workspace',
        description: 'Check current routing and auth structures.',
        actionType: ActionType.READ_FILE,
        target: 'src/App.tsx',
        status: 'PENDING',
        futureDependencies: [],
        estimatedDuration: 1000
      });
      steps.push({
        stepId: randomUUID(),
        title: 'Create Login component',
        description: 'Scaffold the login page UI.',
        actionType: ActionType.CREATE_FILE,
        target: 'src/components/Login.tsx',
        status: 'PENDING',
        futureDependencies: [],
        estimatedDuration: 5000
      });
    } else {
      // Generic mock fallback
      steps.push({
        stepId: randomUUID(),
        title: 'Analyze request',
        description: 'Understand generic user prompt',
        actionType: ActionType.UNKNOWN,
        target: 'unknown',
        status: 'PENDING',
        futureDependencies: [],
        estimatedDuration: 500
      });
    }

    const plan = PlanFactory.create(
      sessionId,
      promptId,
      `Generated plan for: ${promptText.substring(0, 30)}...`,
      steps,
      RiskLevel.LOW,
      true // Default approval required for safety
    );

    const validation = PlanValidator.validate(plan);
    if (!validation.valid) {
      throw new Error(`Plan validation failed: ${validation.errors.join(', ')}`);
    }

    return plan;
  }
}
