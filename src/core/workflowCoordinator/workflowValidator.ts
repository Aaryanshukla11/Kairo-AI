import { WorkflowStage, WorkflowGraph } from './workflowTypes';

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class WorkflowValidator {
  validate(graph: WorkflowGraph): WorkflowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Unresolved dependencies check
    const stageIds = new Set(graph.stages.map(s => s.id));
    for (const stage of graph.stages) {
      for (const depId of stage.dependencies) {
        if (!stageIds.has(depId)) {
          errors.push(`Stage ${stage.id} references non-existent dependency ${depId}.`);
        }
      }
    }

    // 2. Deadlock & Cycle check using DFS
    const visited = new Map<string, 'WHITE' | 'GRAY' | 'BLACK'>();
    graph.stages.forEach(s => visited.set(s.id, 'WHITE'));

    const dfs = (id: string, path: string[]) => {
      visited.set(id, 'GRAY');
      const stage = graph.stages.find(s => s.id === id);
      if (stage) {
        for (const depId of stage.dependencies) {
          const color = visited.get(depId);
          if (color === 'GRAY') {
            errors.push(`Deadlock / circular workflow dependency detected: ${[...path, id, depId].join(' ➔ ')}`);
          } else if (color === 'WHITE') {
            dfs(depId, [...path, id]);
          }
        }
      }
      visited.set(id, 'BLACK');
    };

    for (const stage of graph.stages) {
      if (visited.get(stage.id) === 'WHITE') {
        dfs(stage.id, []);
      }
    }

    // 3. Execution order consistency check
    if (graph.executionOrder.length !== graph.stages.length) {
      errors.push(`Execution order length (${graph.executionOrder.length}) does not match stages count (${graph.stages.length}).`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const workflowValidator = new WorkflowValidator();
