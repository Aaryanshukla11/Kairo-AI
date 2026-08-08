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

    // Derive estimated files from matching generation template mapping count
    let estimatedFiles = 1;
    const desc = prompt.toLowerCase();
    if (desc.includes('calculator')) {
      estimatedFiles = 4;
    } else if (desc.includes('todo') || desc.includes('react')) {
      estimatedFiles = 4;
    } else if (desc.includes('express') || desc.includes('api')) {
      estimatedFiles = 4;
    }
    
    const builder = new PlanBuilder(planId)
      .setTitle(intent.title)
      .setSummary(intent.summary)
      .setRiskLevel(intent.requiresFiles ? RiskLevel.Medium : RiskLevel.Low)
      .setEstimatedFiles(estimatedFiles);

    // Deterministic mock steps
    builder.addTask({
      id: `task-${planId}-1`,
      title: 'Analyze Workspace',
      description: 'Scan the current workspace for existing architecture and dependencies.',
      dependencies: [],
      estimatedTime: '1m'
    });

    builder.addTask({
      id: `task-${planId}-2`,
      title: 'Create Components',
      description: 'Scaffold required UI components and code structures.',
      dependencies: [`task-${planId}-1`],
      estimatedTime: '3m'
    });

    builder.addTask({
      id: `task-${planId}-3`,
      title: 'Update Routes',
      description: 'Configure and update application routing paths.',
      dependencies: [`task-${planId}-2`],
      estimatedTime: '2m'
    });

    builder.addTask({
      id: `task-${planId}-4`,
      title: 'Verify Build',
      description: 'Run basic sanity checks and compiler diagnostics to verify the build.',
      dependencies: [`task-${planId}-3`],
      estimatedTime: '1m'
    });

    builder.addTask({
      id: `task-${planId}-5`,
      title: 'Complete',
      description: 'Finalize execution and output report summary.',
      dependencies: [`task-${planId}-4`],
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
