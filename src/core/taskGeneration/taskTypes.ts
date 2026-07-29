export type TaskType =
  | 'UI Task'
  | 'Backend Task'
  | 'API Task'
  | 'Database Task'
  | 'Configuration Task'
  | 'Testing Task'
  | 'Documentation Task'
  | 'Infrastructure Task'
  | 'Security Task'
  | 'Refactor Task';

export type ExecutionStrategy =
  | 'Sequential'
  | 'Parallel'
  | 'Conditional'
  | 'Blocked'
  | 'Manual Approval';

export type TaskPriority = 'Critical' | 'High' | 'Normal' | 'Low' | 'Background';

export type TaskRiskLevel = 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskModel {
  taskId: string;
  title: string;
  description: string;
  taskType: TaskType;
  parentMilestone: string;
  dependencies: string[]; // Task IDs
  requiredSymbols: string[];
  requiredFiles: string[];
  expectedOutput: string;
  estimatedTimeMs: number;
  estimatedTokens: number;
  risk: TaskRiskLevel;
  priority: TaskPriority;
  confidence: number; // 0.0 - 1.0
  executionStrategy: ExecutionStrategy;
}

export interface TaskGraphNode {
  task: TaskModel;
  children: string[]; // Task IDs
  parents: string[]; // Task IDs
  depth: number;
  inCriticalPath: boolean;
}

export interface TaskGraphEdge {
  fromTaskId: string;
  toTaskId: string;
  edgeType: 'depends_on' | 'triggers' | 'blocks';
}

export interface TaskGraph {
  nodes: Record<string, TaskGraphNode>;
  edges: TaskGraphEdge[];
  rootTaskIds: string[];
  leafTaskIds: string[];
  criticalPath: string[]; // Ordered list of task IDs
  totalEstimatedTimeMs: number;
  totalEstimatedTokens: number;
}

export interface TaskGenerationInput {
  featurePlan: {
    planId: string;
    title: string;
    description: string;
    milestones: Array<{
      milestoneId: string;
      name: string;
      description: string;
      requirements?: string[];
      filesToTouch?: string[];
    }>;
  };
  workspaceContext?: any;
  architectureGraph?: any;
  dependencyGraph?: any;
  conventionKnowledge?: any;
}

export interface TaskGenerationReport {
  reportId: string;
  planId: string;
  taskGraph: TaskGraph;
  executionOrder: string[]; // Task IDs topologically sorted
  parallelBranches: string[][]; // Groups of task IDs that can run concurrently
  taskDependencies: Array<{ taskId: string; dependsOn: string[] }>;
  estimatedEffort: {
    totalTasks: number;
    totalTimeMs: number;
    totalTokens: number;
    criticalPathLength: number;
  };
  riskLevel: TaskRiskLevel;
  confidence: number; // 0.0 - 1.0
  validationPassed: boolean;
  validationErrors: string[];
  intelligence?: {
    htnTree?: any;
    knowledgeGraph?: any;
    constraints?: any[];
    resources?: any;
    recoveryPlans?: any;
    decisions?: any;
    versions?: any;
    observability?: any;
  };
  timestamp: number;
}
