export interface IDagTask {
  id: string;
  title: string;
  description?: string;
  targetFiles: string[];
  requiredCapability: string;
  dependencies?: string[];
  operation?: 'CREATE_FILE' | 'MODIFY_FILE' | 'DELETE_FILE';
}

export interface IDagExecutionLevel {
  levelIndex: number;
  tasks: IDagTask[];
}

export interface IDagScheduleResult {
  levels: IDagExecutionLevel[];
  sortedTaskIds: string[];
}

export function scheduleTaskDag(tasks: IDagTask[]): IDagScheduleResult {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Task-DAG Error: Task list cannot be empty.');
  }

  const taskMap = new Map<string, IDagTask>();
  const inDegree = new Map<string, number>();
  const dependentsMap = new Map<string, string[]>();

  // 1. Validation & Graph Initialization
  for (const task of tasks) {
    if (!task.id || typeof task.id !== 'string') {
      throw new Error('Task-DAG Error: Task missing valid "id".');
    }
    if (taskMap.has(task.id)) {
      throw new Error(`Task-DAG Error: Duplicate task ID found: "${task.id}".`);
    }
    if (!Array.isArray(task.targetFiles) || task.targetFiles.length === 0) {
      throw new Error(`Task-DAG Error: Task "${task.id}" missing valid targetFiles.`);
    }
    if (!task.requiredCapability || typeof task.requiredCapability !== 'string') {
      throw new Error(`Task-DAG Error: Task "${task.id}" missing valid requiredCapability.`);
    }

    taskMap.set(task.id, task);
    inDegree.set(task.id, 0);
    dependentsMap.set(task.id, []);
  }

  // 2. Build In-Degrees & Adjacency List
  for (const task of tasks) {
    const deps = task.dependencies || [];
    for (const depId of deps) {
      if (!taskMap.has(depId)) {
        throw new Error(`Task-DAG Error: Task "${task.id}" references missing dependency "${depId}".`);
      }
      dependentsMap.get(depId)!.push(task.id);
      inDegree.set(task.id, inDegree.get(task.id)! + 1);
    }
  }

  // 3. Topological Level Scheduling (Kahn's Algorithm by Levels)
  const levels: IDagExecutionLevel[] = [];
  const sortedTaskIds: string[] = [];
  let remainingCount = tasks.length;

  let currentLevelTasks: IDagTask[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      currentLevelTasks.push(taskMap.get(id)!);
    }
  }

  let levelIndex = 0;
  while (currentLevelTasks.length > 0) {
    levels.push({
      levelIndex,
      tasks: [...currentLevelTasks]
    });

    const nextLevelTasks: IDagTask[] = [];
    for (const task of currentLevelTasks) {
      sortedTaskIds.push(task.id);
      remainingCount--;

      const dependents = dependentsMap.get(task.id) || [];
      for (const depId of dependents) {
        const newDeg = inDegree.get(depId)! - 1;
        inDegree.set(depId, newDeg);
        if (newDeg === 0) {
          nextLevelTasks.push(taskMap.get(depId)!);
        }
      }
    }

    currentLevelTasks = nextLevelTasks;
    levelIndex++;
  }

  // 4. Cycle Detection
  if (remainingCount > 0) {
    throw new Error('Task-DAG Error: Dependency cycle detected in task graph.');
  }

  return {
    levels,
    sortedTaskIds
  };
}
