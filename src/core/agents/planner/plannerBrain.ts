import { ExecutionPlan, PlannerTaskType } from './plannerTypes';
import { plannerStrategies } from './plannerStrategies';

export class PlannerBrain {
  /**
   * Generates structural ExecutionPlan details based on resolved strategy.
   */
  public async generatePlan(prompt: string): Promise<ExecutionPlan> {
    const strategy = plannerStrategies.resolveStrategy(prompt);

    const affectedFiles: string[] = ['src/core/agents/planner/plannerAgent.ts'];
    const tasks = [
      {
        id: 'task-1',
        title: 'Analyze workspace dependencies',
        type: PlannerTaskType.Analyze,
        description: 'Read package.json imports and index dependencies maps.',
        affectedFiles: [],
        dependencies: []
      },
      {
        id: 'task-2',
        title: 'Synthesize module code structure',
        type: PlannerTaskType.Create,
        description: 'Write index barrel exporters and typescript classes.',
        affectedFiles,
        dependencies: ['task-1']
      },
      {
        id: 'task-3',
        title: 'Write validation tests specifications',
        type: PlannerTaskType.Test,
        description: 'Test schemas structures validations.',
        affectedFiles: ['tests/unit/planner.test.ts'],
        dependencies: ['task-2']
      }
    ];

    const plan: ExecutionPlan = {
      id: `plan-${Date.now()}`,
      goal: `Synthesize foundation for request: "${prompt}"`,
      summary: `This plan outlines steps to create necessary files and verify validations rules for strategy: ${strategy}.`,
      strategy,
      priority: 'high',
      estimatedDurationMin: 45,
      affectedFiles: ['src/core/agents/planner/plannerAgent.ts', 'tests/unit/planner.test.ts'],
      dependencies: [],
      tasks,
      riskAssessment: {
        complexity: 'medium',
        riskScore: 25,
        mitigationStrategy: 'Validate parameter shapes sequentially before triggers.'
      },
      validationSummary: {
        valid: true,
        errors: []
      }
    };

    return plan;
  }
}

export const plannerBrain = new PlannerBrain();
