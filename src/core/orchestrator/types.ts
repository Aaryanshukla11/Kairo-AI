import { IAIKernelCompiledRequest } from '../ai-kernel/types';

export type OrchestrationStage =
  | 'WORKFLOW_INITIALIZED'
  | 'TASK_DECOMPOSITION'
  | 'DEPENDENCY_GRAPH_BUILT'
  | 'QUEUE_ENQUEUED'
  | 'AGENT_MANAGER_FORWARD'
  | 'WORKFLOW_COMPLETED'
  | 'WORKFLOW_FAILED';

export interface IOrchestratorStageLog {
  readonly stage: OrchestrationStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface IWorkflowTask {
  readonly taskId: string;
  readonly title: string;
  readonly assignedAgentId: string;
  readonly taskType: string;
  readonly priority: TaskPriority;
  readonly dependencies: readonly string[];
  readonly payload: Record<string, any>;
  readonly status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export interface IWorkflowContext {
  readonly sessionId: string;
  readonly workflowId: string;
  readonly requestId: string;
  readonly rawPrompt: string;
  readonly intent: string;
  readonly projectInfo: {
    readonly name: string | null;
    readonly type: string;
  };
  readonly techStack: Record<string, any>;
  readonly selectedModel: {
    readonly modelId: string;
    readonly name: string;
    readonly type: string;
  };
  readonly taskQueue: readonly IWorkflowTask[];
  readonly status: 'INITIALIZED' | 'TASK_PLANNING' | 'QUEUED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface IOrchestrationResult {
  readonly sessionId: string;
  readonly workflowId: string;
  readonly requestId: string;
  readonly status: 'SUCCESS' | 'FAILED';
  readonly workflowContext: IWorkflowContext;
  readonly tasksCompleted: number;
  readonly tasksFailed: number;
  readonly agentResults: readonly any[];
  readonly orchestratorLogs: readonly IOrchestratorStageLog[];
  readonly errors: readonly string[];
}

export interface IOrchestrator {
  executeWorkflow(compiledRequest: IAIKernelCompiledRequest): Promise<IOrchestrationResult>;
  getLogs(): readonly IOrchestratorStageLog[];
  getActiveWorkflows(): readonly IWorkflowContext[];
  clearHistory(): void;
}
