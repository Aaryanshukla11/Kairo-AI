import { IPlanningContract, TaskType, TaskPriority } from '../types';

export class PlanningContractValidator {
  public validate(contract: IPlanningContract): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate version semantic format
    if (!contract.contractVersion || !/^\d+\.\d+\.\d+$/.test(contract.contractVersion)) {
      errors.push(`Invalid contract version format: '${contract.contractVersion}'. Must use semver format (e.g., '1.0.0').`);
    }

    // 2. Validate request identification
    if (!contract.requestId) {
      errors.push('Missing required field: requestId');
    }

    // 3. Project name and type validations
    if (!contract.projectInfo.name) {
      errors.push('Missing required field: projectInfo.name');
    }
    if (!contract.projectInfo.type || contract.projectInfo.type === 'Unknown') {
      errors.push('Missing required field: projectInfo.type');
    }

    // 4. Task Graph checks
    const taskIds = new Set<string>();
    const taskTypes: Set<TaskType> = new Set([
      'CREATE_STRUCTURE',
      'GENERATE_FRONTEND',
      'GENERATE_BACKEND',
      'GENERATE_DATABASE',
      'GENERATE_API',
      'GENERATE_AUTH',
      'GENERATE_CONFIGURATION',
      'GENERATE_DOCUMENTATION',
      'GENERATE_TESTS',
      'EXECUTE_PROJECT',
      'VALIDATE_PROJECT'
    ]);

    const priorities: Set<TaskPriority> = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

    for (const task of contract.taskGraph) {
      // Check duplicate Task IDs
      if (taskIds.has(task.taskId)) {
        errors.push(`Duplicate task ID detected: '${task.taskId}'`);
      }
      taskIds.add(task.taskId);

      // Check task type validity
      if (!taskTypes.has(task.taskType)) {
        errors.push(`Unknown task type detected: '${task.taskType}' in task '${task.taskId}'`);
      }

      // Check task priority validity
      if (!priorities.has(task.priority)) {
        errors.push(`Invalid task priority detected: '${task.priority}' in task '${task.taskId}'`);
      }

      // Check execution order numbers validity
      if (typeof task.executionOrder !== 'number' || task.executionOrder < 0) {
        errors.push(`Invalid execution order number: '${task.executionOrder}' in task '${task.taskId}'`);
      }
    }

    // 5. Dependency checks
    for (const task of contract.taskGraph) {
      for (const dep of task.dependencies) {
        if (!taskIds.has(dep)) {
          errors.push(`Broken dependency: task '${task.taskId}' references non-existent task ID '${dep}'`);
        }
      }
    }

    // 6. Circular dependency checks (using DFS stack)
    if (errors.length === 0) {
      const hasCycle = this.detectCircularDependencies(contract.taskGraph);
      if (hasCycle) {
        errors.push('Circular dependency path detected in the task graph.');
      }
    }

    // 7. Config warnings check
    if (!contract.projectInfo.database) {
      warnings.push('Database not selected.');
    }
    if (!contract.projectInfo.authentication) {
      warnings.push('Authentication missing.');
    }
    if (!contract.projectInfo.frontendFramework && !contract.projectInfo.backendFramework) {
      warnings.push('Technology not specified.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private detectCircularDependencies(tasks: readonly any[]): boolean {
    const adjList: Map<string, string[]> = new Map();
    for (const t of tasks) {
      adjList.set(t.taskId, [...t.dependencies]);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (recStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recStack.add(node);

      const neighbors = adjList.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(node);
      return false;
    };

    for (const node of adjList.keys()) {
      if (dfs(node)) return true;
    }

    return false;
  }
}

export const planningContractValidator = new PlanningContractValidator();
export default planningContractValidator;
