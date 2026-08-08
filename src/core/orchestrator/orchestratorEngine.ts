import { IAIKernelCompiledRequest } from '../ai-kernel/types';
import { agentManager, AgentManager } from '../agents/agentManager';
import { AgentTask } from '../agents/agentTypes';
import {
  IOrchestrator,
  IWorkflowContext,
  IWorkflowTask,
  IOrchestrationResult,
  IOrchestratorStageLog,
  TaskPriority
} from './types';
import * as crypto from 'crypto';

export class OrchestratorEngine implements IOrchestrator {
  private logs: IOrchestratorStageLog[] = [];
  private activeWorkflows: Map<string, IWorkflowContext> = new Map();
  private agentManager: AgentManager;

  constructor(manager: AgentManager = agentManager) {
    this.agentManager = manager;
  }

  public getLogs(): readonly IOrchestratorStageLog[] {
    return Object.freeze([...this.logs]);
  }

  public getActiveWorkflows(): readonly IWorkflowContext[] {
    return Object.freeze(Array.from(this.activeWorkflows.values()));
  }

  public clearHistory(): void {
    this.logs = [];
    this.activeWorkflows.clear();
  }

  private emitLog(stageLog: IOrchestratorStageLog): void {
    this.logs.push(stageLog);
  }

  /**
   * Main entry point for Orchestrator Runtime execution.
   * Receives compiled request from AI Kernel, initializes Workflow Context,
   * generates unique Session ID & Task IDs, builds task queue, and forwards to AgentManager.
   */
  public async executeWorkflow(compiledRequest: IAIKernelCompiledRequest): Promise<IOrchestrationResult> {
    console.log('[TRACE] [Orchestrator] ENTER: executeWorkflow. Request ID:', compiledRequest.requestId);
    const startTime = Date.now();
    const requestId = compiledRequest.requestId;
    const uid = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 8);
    const sessionId = `session-${Date.now()}-${uid}`;
    const workflowId = `wf-${Date.now()}-${uid}`;

    // STAGE 1: WORKFLOW INITIALIZATION
    this.emitLog({
      stage: 'WORKFLOW_INITIALIZED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Initialized workflow context with Session ID '${sessionId}' for request '${requestId}'`,
      details: {
        sessionId,
        workflowId,
        requestId,
        intent: compiledRequest.intent,
        selectedModel: compiledRequest.routingDecision.selectedModel.modelId
      }
    });

    try {
      // STAGE 2: TASK DECOMPOSITION
      const stage2Start = Date.now();
      const rawTasks = this.decomposeRequestIntoTasks(sessionId, compiledRequest);

      this.emitLog({
        stage: 'TASK_DECOMPOSITION',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Decomposed request into ${rawTasks.length} executable tasks`,
        details: {
          sessionId,
          workflowId,
          taskCount: rawTasks.length,
          taskIds: rawTasks.map(t => t.taskId),
          executionTimeMs: Date.now() - stage2Start
        }
      });

      // STAGE 3: DEPENDENCY GRAPH CONSTRUCTION
      const stage3Start = Date.now();
      const workflowTasks = this.buildDependencyGraph(rawTasks);

      this.emitLog({
        stage: 'DEPENDENCY_GRAPH_BUILT',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Built dependency graph and prioritized task order`,
        details: {
          sessionId,
          workflowId,
          dependencies: workflowTasks.map(t => ({ taskId: t.taskId, priority: t.priority, dependsOn: t.dependencies })),
          executionTimeMs: Date.now() - stage3Start
        }
      });

      // STAGE 4: ENQUEUE EXECUTION QUEUE
      const stage4Start = Date.now();
      const context: IWorkflowContext = {
        sessionId,
        workflowId,
        requestId,
        rawPrompt: compiledRequest.rawPrompt,
        intent: compiledRequest.intent,
        projectInfo: {
          name: compiledRequest.promptContext.projectInfo.name,
          type: compiledRequest.promptContext.projectInfo.type
        },
        techStack: compiledRequest.promptContext.detectedTechnologies,
        selectedModel: {
          modelId: compiledRequest.routingDecision.selectedModel.modelId,
          name: compiledRequest.routingDecision.selectedModel.name,
          type: compiledRequest.routingDecision.selectedModel.type
        },
        taskQueue: Object.freeze(workflowTasks),
        status: 'QUEUED',
        createdAt: startTime,
        updatedAt: Date.now()
      };

      this.activeWorkflows.set(sessionId, context);

      this.emitLog({
        stage: 'QUEUE_ENQUEUED',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Enqueued ${workflowTasks.length} tasks into execution queue`,
        details: {
          sessionId,
          workflowId,
          queuedTasksCount: workflowTasks.length,
          executionTimeMs: Date.now() - stage4Start
        }
      });

      // STAGE 5: FORWARD TO AGENT MANAGER
      const stage5Start = Date.now();
      this.emitLog({
        stage: 'AGENT_MANAGER_FORWARD',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Forwarding task queue to Agent Manager`,
        details: {
          sessionId,
          workflowId,
          taskCount: workflowTasks.length
        }
      });

      // Convert IWorkflowTask items into AgentTask format for AgentManager
      const agentTasks: AgentTask[] = workflowTasks.map(t => ({
        id: t.taskId,
        title: t.title,
        assignedAgentId: t.assignedAgentId,
        payload: {
          ...t.payload,
          sessionId,
          workflowId,
          requestId,
          taskType: t.taskType,
          priority: t.priority
        },
        status: 'pending'
      }));

      const agentResult = await this.agentManager.dispatchWorkflowTasks(agentTasks);

      // Update Workflow Context state
      const isSuccess = agentResult.failedCount === 0;
      const completedContext: IWorkflowContext = {
        ...context,
        status: isSuccess ? 'COMPLETED' : 'FAILED',
        updatedAt: Date.now()
      };
      this.activeWorkflows.set(sessionId, completedContext);

      const finalStage = isSuccess ? 'WORKFLOW_COMPLETED' : 'WORKFLOW_FAILED';
      this.emitLog({
        stage: finalStage,
        timestamp: Date.now(),
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        message: `Workflow ${sessionId} ${isSuccess ? 'completed successfully' : 'failed with errors'}`,
        details: {
          sessionId,
          workflowId,
          tasksCompleted: agentResult.completedCount,
          tasksFailed: agentResult.failedCount,
          executionTimeMs: Date.now() - stage5Start
        }
      });

      const result = {
        sessionId,
        workflowId,
        requestId,
        status: (isSuccess ? 'SUCCESS' : 'FAILED') as 'SUCCESS' | 'FAILED',
        workflowContext: completedContext,
        tasksCompleted: agentResult.completedCount,
        tasksFailed: agentResult.failedCount,
        agentResults: agentResult.results,
        orchestratorLogs: Object.freeze([...this.logs]),
        errors: agentResult.errors
      };
      console.log('[TRACE] [Orchestrator] EXIT: executeWorkflow completed. Status:', result.status);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emitLog({
        stage: 'WORKFLOW_FAILED',
        timestamp: Date.now(),
        status: 'FAILED',
        message: `Workflow orchestration failed: ${errorMsg}`,
        details: { sessionId, workflowId, error: errorMsg }
      });

      const failedContext: IWorkflowContext = {
        sessionId,
        workflowId,
        requestId,
        rawPrompt: compiledRequest.rawPrompt,
        intent: compiledRequest.intent,
        projectInfo: {
          name: compiledRequest.promptContext.projectInfo.name,
          type: compiledRequest.promptContext.projectInfo.type
        },
        techStack: compiledRequest.promptContext.detectedTechnologies,
        selectedModel: {
          modelId: compiledRequest.routingDecision.selectedModel.modelId,
          name: compiledRequest.routingDecision.selectedModel.name,
          type: compiledRequest.routingDecision.selectedModel.type
        },
        taskQueue: Object.freeze([]),
        status: 'FAILED',
        createdAt: startTime,
        updatedAt: Date.now()
      };

      const resultFailed = {
        sessionId,
        workflowId,
        requestId,
        status: 'FAILED' as const,
        workflowContext: failedContext,
        tasksCompleted: 0,
        tasksFailed: 1,
        agentResults: [],
        orchestratorLogs: Object.freeze([...this.logs]),
        errors: Object.freeze([errorMsg])
      };
      console.log('[TRACE] [Orchestrator] EXIT: executeWorkflow completed with error. Status:', resultFailed.status);
      return resultFailed;
    }
  }

  /**
   * Decomposes compiled AI Kernel request into executable workflow tasks with assigned priorities.
   */
  private decomposeRequestIntoTasks(sessionId: string, compiledRequest: IAIKernelCompiledRequest): IWorkflowTask[] {
    const tasks: IWorkflowTask[] = [];

    if (compiledRequest.intent === 'NEW_PROJECT') {
      // NEW_PROJECT Pipeline Tasks (6-stage intent-driven workflow)
      // Task 1: Prompt Requirement Analysis & Intent Scope
      const task1Id = `task-${sessionId}-1`;
      tasks.push({
        taskId: task1Id,
        title: 'Analyze Prompt Requirements & Extract Scope',
        assignedAgentId: 'requirement-agent',
        taskType: 'REQUIREMENT_ANALYSIS',
        priority: 'CRITICAL',
        dependencies: [],
        payload: {
          rawPrompt: compiledRequest.rawPrompt,
          requestId: compiledRequest.requestId,
          sessionId,
          intent: compiledRequest.intent,
          techStack: compiledRequest.promptContext.detectedTechnologies
        },
        status: 'QUEUED'
      });

      // Task 2: Generate Software Architecture Blueprint
      const task2Id = `task-${sessionId}-2`;
      tasks.push({
        taskId: task2Id,
        title: 'Generate Software Architecture Blueprint',
        assignedAgentId: 'architecture-agent',
        taskType: 'ARCHITECTURE_BLUEPRINT',
        priority: 'CRITICAL',
        dependencies: [task1Id],
        payload: {
          rawPrompt: compiledRequest.rawPrompt,
          requestId: compiledRequest.requestId,
          sessionId,
          intent: compiledRequest.intent,
          techStack: compiledRequest.promptContext.detectedTechnologies
        },
        status: 'QUEUED'
      });

      // Task 3: Generate Executable Project Generation Plan
      const task3Id = `task-${sessionId}-3`;
      tasks.push({
        taskId: task3Id,
        title: 'Generate Executable Project Generation Plan',
        assignedAgentId: 'planner-agent',
        taskType: 'GENERATION_PLAN',
        priority: 'CRITICAL',
        dependencies: [task2Id],
        payload: {
          rawPrompt: compiledRequest.rawPrompt,
          requestId: compiledRequest.requestId,
          sessionId,
          intent: compiledRequest.intent,
          techStack: compiledRequest.promptContext.detectedTechnologies
        },
        status: 'QUEUED'
      });

      // Task 4: Execute Central Generator SDK Framework Pipeline
      const task4Id = `task-${sessionId}-4`;
      tasks.push({
        taskId: task4Id,
        title: 'Execute Central Generator SDK Framework Pipeline',
        assignedAgentId: 'generator-sdk-agent',
        taskType: 'GENERATOR_SDK',
        priority: 'CRITICAL',
        dependencies: [task3Id],
        payload: {
          rawPrompt: compiledRequest.rawPrompt,
          requestId: compiledRequest.requestId,
          sessionId,
          intent: compiledRequest.intent,
          techStack: compiledRequest.promptContext.detectedTechnologies
        },
        status: 'QUEUED'
      });

      // Task 5: Synthesize Application Code & Artifacts
      const task5Id = `task-${sessionId}-5`;
      tasks.push({
        taskId: task5Id,
        title: 'Synthesize Application Code & Artifacts',
        assignedAgentId: 'executor-agent',
        taskType: 'CODE_SYNTHESIS',
        priority: 'CRITICAL',
        dependencies: [task4Id],
        payload: {
          rawPrompt: compiledRequest.rawPrompt,
          aiRequest: compiledRequest.aiRequest,
          modelId: compiledRequest.routingDecision.selectedModel.modelId,
          workspacePath: compiledRequest.workspacePath,
          provider: compiledRequest.provider,
          codingProvider: compiledRequest.codingProvider,
          fsAdapter: compiledRequest.fsAdapter
        },
        status: 'QUEUED'
      });

      // Task 6: Review Generated Code Quality
      const task6Id = `task-${sessionId}-6`;
      tasks.push({
        taskId: task6Id,
        title: 'Review Generated Code Quality',
        assignedAgentId: 'reviewer-agent',
        taskType: 'CODE_REVIEW',
        priority: 'MEDIUM',
        dependencies: [task5Id],
        payload: {
          intent: compiledRequest.intent
        },
        status: 'QUEUED'
      });

      return tasks;
    }

    // Task 1: Prompt Requirement Analysis & Intent Scope
    const task1Id = `task-${sessionId}-1`;
    tasks.push({
      taskId: task1Id,
      title: 'Analyze Prompt Requirements & Extract Scope',
      assignedAgentId: 'requirement-agent',
      taskType: 'REQUIREMENT_ANALYSIS',
      priority: 'CRITICAL',
      dependencies: [],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 2: Project Intelligence Analysis & Architecture Classification
    const task2Id = `task-${sessionId}-2`;
    tasks.push({
      taskId: task2Id,
      title: 'Analyze Project Intelligence & Classify Architecture',
      assignedAgentId: 'project-intelligence-agent',
      taskType: 'PROJECT_INTELLIGENCE',
      priority: 'CRITICAL',
      dependencies: [task1Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 3: Engineering Decision & Technology Strategy Selection
    const task3Id = `task-${sessionId}-3`;
    tasks.push({
      taskId: task3Id,
      title: 'Formulate Engineering Technical Decisions',
      assignedAgentId: 'engineering-decision-agent',
      taskType: 'ENGINEERING_DECISION',
      priority: 'CRITICAL',
      dependencies: [task2Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 4: Architecture Blueprint Formulation
    const task4Id = `task-${sessionId}-4`;
    tasks.push({
      taskId: task4Id,
      title: 'Generate Software Architecture Blueprint',
      assignedAgentId: 'architecture-agent',
      taskType: 'ARCHITECTURE_BLUEPRINT',
      priority: 'CRITICAL',
      dependencies: [task3Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 5: Workspace Blueprint & Boundaries Planning
    const task5Id = `task-${sessionId}-5`;
    tasks.push({
      taskId: task5Id,
      title: 'Generate Workspace Blueprint & Layout Boundaries',
      assignedAgentId: 'workspace-agent',
      taskType: 'WORKSPACE_BLUEPRINT',
      priority: 'CRITICAL',
      dependencies: [task4Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 6: Project Manifest Generation & Single Source of Truth
    const task6Id = `task-${sessionId}-6`;
    tasks.push({
      taskId: task6Id,
      title: 'Generate Project Single Source of Truth Manifest',
      assignedAgentId: 'project-manifest-agent',
      taskType: 'PROJECT_MANIFEST',
      priority: 'CRITICAL',
      dependencies: [task5Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 7: Generation Planning & Execution Queue Construction
    const task7Id = `task-${sessionId}-7`;
    tasks.push({
      taskId: task7Id,
      title: 'Generate Executable Project Generation Plan',
      assignedAgentId: 'planner-agent',
      taskType: 'GENERATION_PLAN',
      priority: 'CRITICAL',
      dependencies: [task6Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 8: Central Generator SDK Framework Execution
    const task8Id = `task-${sessionId}-8`;
    tasks.push({
      taskId: task8Id,
      title: 'Execute Central Generator SDK Framework Pipeline',
      assignedAgentId: 'generator-sdk-agent',
      taskType: 'GENERATOR_SDK',
      priority: 'CRITICAL',
      dependencies: [task7Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        requestId: compiledRequest.requestId,
        sessionId,
        intent: compiledRequest.intent,
        techStack: compiledRequest.promptContext.detectedTechnologies
      },
      status: 'QUEUED'
    });

    // Task 9: Memory & Architectural Context Retrieval
    const task9Id = `task-${sessionId}-9`;
    tasks.push({
      taskId: task9Id,
      title: 'Sync Project Memory Context',
      assignedAgentId: 'memory-agent',
      taskType: 'MEMORY_SYNC',
      priority: 'HIGH',
      dependencies: [task8Id],
      payload: {
        query: compiledRequest.intent,
        memoriesCount: compiledRequest.memories.length
      },
      status: 'QUEUED'
    });

    // Task 10: Execution & Code Synthesis
    const task10Id = `task-${sessionId}-10`;
    tasks.push({
      taskId: task10Id,
      title: 'Synthesize Application Code & Artifacts',
      assignedAgentId: 'executor-agent',
      taskType: 'CODE_SYNTHESIS',
      priority: 'CRITICAL',
      dependencies: [task9Id],
      payload: {
        rawPrompt: compiledRequest.rawPrompt,
        aiRequest: compiledRequest.aiRequest,
        modelId: compiledRequest.routingDecision.selectedModel.modelId,
        workspacePath: compiledRequest.workspacePath,
        provider: compiledRequest.provider,
        codingProvider: compiledRequest.codingProvider,
        fsAdapter: compiledRequest.fsAdapter
      },
      status: 'QUEUED'
    });

    // Task 11: Quality Assurance & Review
    const task11Id = `task-${sessionId}-11`;
    tasks.push({
      taskId: task11Id,
      title: 'Review Generated Code Quality',
      assignedAgentId: 'reviewer-agent',
      taskType: 'CODE_REVIEW',
      priority: 'MEDIUM',
      dependencies: [task10Id],
      payload: {
        intent: compiledRequest.intent
      },
      status: 'QUEUED'
    });

    return tasks;
  }

  /**
   * Sorts tasks by dependency order and priority.
   */
  private buildDependencyGraph(tasks: IWorkflowTask[]): IWorkflowTask[] {
    const priorityWeight: Record<TaskPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    // Topological sort preserving priority order
    return [...tasks].sort((a, b) => {
      if (a.dependencies.includes(b.taskId)) return 1;
      if (b.dependencies.includes(a.taskId)) return -1;
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }
}

export const orchestratorEngine = new OrchestratorEngine();
export default orchestratorEngine;
