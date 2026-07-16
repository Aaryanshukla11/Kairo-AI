import { ExecutionPlan, RiskLevel } from './types';
import { validatePrompt, validatePlan } from './validator';
import { parsePromptIntoIntent } from './parser';
import { PlanBuilder } from './planBuilder';

export class ExecutionPlanner {
  
  /**
   * Main entrypoint for generating a deterministic ExecutionPlan from a prompt.
   * Throws an error if the prompt is invalid or if plan generation fails.
   */
  public generatePlan(prompt: string): ExecutionPlan {
    if (!validatePrompt(prompt)) {
      throw new Error('Invalid prompt: Prompt cannot be empty.');
    }

    const intent = parsePromptIntoIntent(prompt);
    const planId = `plan-${Date.now()}`;
    
    const builder = new PlanBuilder(planId)
      .setTitle(intent.title)
      .setSummary(intent.summary)
      .setRiskLevel(intent.requiresFiles ? RiskLevel.Medium : RiskLevel.Low)
      .setEstimatedFiles(intent.requiresFiles ? 3 : 0);

    // Deterministic mock steps
    builder.addTask({
      id: `task-${planId}-1`,
      title: 'Analyze Workspace',
      description: 'Scan the current workspace for existing architecture and dependencies.',
      dependencies: [],
      estimatedTime: '1m'
    });

    if (intent.requiresFiles) {
      builder.addTask({
        id: `task-${planId}-2`,
        title: 'Create Components',
        description: 'Scaffold required files based on user intent.',
        dependencies: [`task-${planId}-1`],
        estimatedTime: '3m'
      });
      builder.addTask({
        id: `task-${planId}-3`,
        title: 'Create Styles',
        description: 'Apply requested styling to newly created components.',
        dependencies: [`task-${planId}-2`],
        estimatedTime: '2m'
      });
    } else {
      builder.addTask({
        id: `task-${planId}-2`,
        title: 'Execute General Action',
        description: 'Process user request sequentially.',
        dependencies: [`task-${planId}-1`],
        estimatedTime: '2m'
      });
    }

    builder.addTask({
      id: `task-${planId}-4`,
      title: 'Verify Build',
      description: 'Run basic sanity checks to ensure no syntax errors were introduced.',
      dependencies: [`task-${planId}-2`],
      estimatedTime: '1m'
    });

    const plan = builder.build();

    if (!validatePlan(plan)) {
      throw new Error('Failed to build a valid Execution Plan.');
    }

    return plan;
  }
}

// Singleton instance export
export const plannerEngine = new ExecutionPlanner();
