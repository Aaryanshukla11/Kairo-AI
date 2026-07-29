import { TaskGraph, TaskGenerationInput } from './taskTypes';

export class TaskValidator {
  public validate(graph: TaskGraph, input: TaskGenerationInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodeIds = Object.keys(graph.nodes);

    if (nodeIds.length === 0) {
      errors.push('Task Graph is empty. No tasks were generated.');
      return { valid: false, errors };
    }

    // 1. Cycle Detection (DFS with 3 colors: 0=unvisited, 1=visiting, 2=visited)
    const visitedState: Record<string, number> = {};
    for (const id of nodeIds) visitedState[id] = 0;

    let hasCycle = false;

    const dfsCycle = (id: string, path: string[]) => {
      visitedState[id] = 1;
      for (const childId of graph.nodes[id].children) {
        if (visitedState[childId] === 1) {
          hasCycle = true;
          errors.push(`Circular dependency detected: ${[...path, id, childId].join(' -> ')}`);
        } else if (visitedState[childId] === 0) {
          dfsCycle(childId, [...path, id]);
        }
      }
      visitedState[id] = 2;
    };

    for (const id of nodeIds) {
      if (visitedState[id] === 0) {
        dfsCycle(id, []);
      }
    }

    // 2. Orphan Task Detection
    for (const id of nodeIds) {
      const node = graph.nodes[id];
      if (node.parents.length === 0 && node.children.length === 0 && nodeIds.length > 1) {
        errors.push(`Orphan task detected: ${id} has no parents or children in multi-task graph.`);
      }
    }

    // 3. Complete Milestone Coverage
    const milestoneIds = new Set(input.featurePlan.milestones.map(m => m.milestoneId));
    const coveredMilestones = new Set<string>();

    for (const id of nodeIds) {
      coveredMilestones.add(graph.nodes[id].task.parentMilestone);
    }

    for (const msId of milestoneIds) {
      if (!coveredMilestones.has(msId)) {
        errors.push(`Uncovered milestone: Milestone ${msId} has no associated tasks.`);
      }
    }

    return {
      valid: errors.length === 0 && !hasCycle,
      errors
    };
  }
}
export const taskValidator = new TaskValidator();
