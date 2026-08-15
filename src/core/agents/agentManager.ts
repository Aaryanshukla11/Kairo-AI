import { AgentTask, AgentDefinition, AgentStatus, IAgentManagerLog, AgentManagerStage } from './agentTypes';
import { agentRuntimeInstance, AgentRuntime } from './agentRuntime';
import { agentRegistry, AgentRegistry } from './agentRegistry';
import { BaseAgent } from './base';
import { globalKairoEventBus } from '../eventBus/runtime/kairoEventBus';

export class AgentManager {
  private runtime: AgentRuntime;
  private registry: AgentRegistry;
  private logs: IAgentManagerLog[] = [];
  private listeners: Array<(log: IAgentManagerLog) => void> = [];

  constructor(runtime: AgentRuntime = agentRuntimeInstance, registry: AgentRegistry = agentRegistry) {
    this.runtime = runtime;
    this.registry = registry;

    // Automatically log startup registration for all registered agents
    this.logStartupRegistrations();
  }

  public getLogs(): readonly IAgentManagerLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: (log: IAgentManagerLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitLog(stageLog: IAgentManagerLog): void {
    this.logs.push(stageLog);
    for (const listener of this.listeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[AgentManager] Error in log listener:', err);
      }
    }
  }

  private logStartupRegistrations(): void {
    const agents = this.registry.list();
    for (const agent of agents) {
      this.emitLog({
        stage: 'REGISTRATION',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Registered agent '${agent.definition.name}' (${agent.id})`,
        details: {
          agentId: agent.id,
          name: agent.definition.name,
          role: agent.definition.role,
          version: agent.definition.version,
          capabilities: agent.definition.capabilities,
          permissions: agent.definition.permissions,
          priority: agent.definition.priority
        }
      });
    }
  }

  /**
   * Capability Mapping & Discovery API: Returns agents that support a specific capability.
   */
  public getAgentsByCapability(capability: string): BaseAgent[] {
    return this.registry.list().filter(agent =>
      agent.definition.capabilities.some(c => c.toLowerCase() === capability.toLowerCase())
    );
  }

  /**
   * Capability Mapping API: Returns a dictionary mapping capabilities to supporting agent IDs.
   */
  public getCapabilityMap(): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const agent of this.registry.list()) {
      for (const cap of agent.definition.capabilities) {
        if (!map[cap]) map[cap] = [];
        map[cap].push(agent.id);
      }
    }
    return map;
  }

  /**
   * Dynamic Agent Selection: Resolves appropriate agent based on taskType or capability matching.
   */
  public findAgentForTask(taskTypeOrHint: string): BaseAgent | null {
    const hint = taskTypeOrHint.toLowerCase();
    
    // Explicit taskType to Agent mapping
    const typeMapping: Record<string, string> = {
      'memory_sync': 'memory-agent',
      'arch_verification': 'architecture-agent',
      'code_synthesis': 'executor-agent',
      'code_review': 'reviewer-agent',
      'testing': 'testing-agent',
      'security_scan': 'security-agent',
      'documentation': 'documentation-agent',
      'refactoring': 'refactoring-agent',
      'debug': 'debug-agent',
      'performance': 'performance-agent',
      'dependency': 'dependency-agent',
      'planning': 'planner-agent',
      'workspace': 'workspace-agent',
      'retrieval': 'retriever-agent'
    };

    if (typeMapping[hint]) {
      const agent = this.registry.get(typeMapping[hint]);
      if (agent) return agent;
    }

    // Capability fallback search
    const matchingAgents = this.getAgentsByCapability(hint);
    if (matchingAgents.length > 0) {
      return matchingAgents[0];
    }

    // Default fallback agent
    return this.registry.get('executor-agent');
  }

  /**
   * Forwards a single task to the assigned downstream agent via AgentRuntime.
   * Tracks execution status ('pending' -> 'running' -> 'completed' / 'failed').
   */
  public async dispatchTask(task: AgentTask): Promise<any> {
    const startTime = Date.now();
    let selectedAgent = task.assignedAgentId ? this.registry.get(task.assignedAgentId) : null;

    if (!selectedAgent) {
      const taskHint = task.payload?.taskType || task.title;
      selectedAgent = this.findAgentForTask(taskHint);
    }

    if (!selectedAgent) {
      const errorMsg = `[AgentManager] No suitable agent found for task '${task.id}' (assigned: '${task.assignedAgentId}')`;
      task.status = 'failed';
      task.error = errorMsg;

      this.emitLog({
        stage: 'TASK_FAILED',
        timestamp: Date.now(),
        status: 'FAILED',
        message: errorMsg,
        details: { taskId: task.id, assignedAgentId: task.assignedAgentId }
      });
      throw new Error(errorMsg);
    }

    // Update task's assignedAgentId if dynamically resolved
    task.assignedAgentId = selectedAgent.id;

    // STAGE 1: AGENT SELECTION
    this.emitLog({
      stage: 'AGENT_SELECTION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Selected agent '${selectedAgent.definition.name}' (${selectedAgent.id}) for task '${task.id}'`,
      details: {
        taskId: task.id,
        agentId: selectedAgent.id,
        agentName: selectedAgent.definition.name,
        taskTitle: task.title
      }
    });

    // STAGE 2: TASK DISPATCH
    task.status = 'running';

    const agentSeqMap: Record<string, string> = {
      'requirement-agent': 'RequirementAgent',
      'project-intelligence-agent': 'ProjectIntelligenceAgent',
      'engineering-decision-agent': 'EngineeringDecisionAgent',
      'architecture-agent': 'ArchitectureAgent',
      'workspace-agent': 'WorkspaceAgent',
      'project-manifest-agent': 'ProjectManifestAgent',
      'planner-agent': 'GenerationPlanner',
      'generator-sdk-agent': 'GeneratorSDK',
      'executor-agent': 'Executor',
      'reviewer-agent': 'Reviewer'
    };
    const seqName = agentSeqMap[selectedAgent.id];
    if (seqName) {
      console.log(`[Orchestrator][AgentSequence] ${seqName} - executionId: ${task.payload?.requestId || task.id}`);
    }

    this.emitLog({
      stage: 'TASK_DISPATCH',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Dispatching task '${task.id}' to agent '${selectedAgent.id}'`,
      details: {
        taskId: task.id,
        agentId: selectedAgent.id,
        payload: task.payload
      }
    });

    const requestId = task.payload?.requestId || task.id;
    const sessionId = task.payload?.sessionId || task.id;

    // Granular Stage Start Events
    if (selectedAgent.id === 'requirement-agent') {
      await globalKairoEventBus.publish({
        eventId: `evt-req-start-${Date.now()}`,
        eventType: 'RequirementAnalysisStarted',
        timestamp: Date.now(),
        source: 'RequirementAgent',
        priority: 'HIGH',
        correlationId: requestId,
        sessionId,
        payload: { requestId, sessionId, stage: 'Analyzing Requirements' }
      });
    } else if (selectedAgent.id === 'architecture-agent') {
      await globalKairoEventBus.publish({
        eventId: `evt-arch-start-${Date.now()}`,
        eventType: 'ArchitectureGenerationStarted',
        timestamp: Date.now(),
        source: 'ArchitectureAgent',
        priority: 'HIGH',
        correlationId: requestId,
        sessionId,
        payload: { requestId, sessionId, stage: 'Designing Architecture' }
      });
    } else if (selectedAgent.id === 'planner-agent') {
      await globalKairoEventBus.publish({
        eventId: `evt-plan-start-${Date.now()}`,
        eventType: 'ImplementationPlanStarted',
        timestamp: Date.now(),
        source: 'PlannerAgent',
        priority: 'HIGH',
        correlationId: requestId,
        sessionId,
        payload: { requestId, sessionId, stage: 'Building Implementation Plan' }
      });
    } else if (selectedAgent.id === 'generator-sdk-agent' || selectedAgent.id === 'generator-agent') {
      await globalKairoEventBus.publish({
        eventId: `evt-gen-start-${Date.now()}`,
        eventType: 'GenerationStarted',
        timestamp: Date.now(),
        source: 'GeneratorAgent',
        priority: 'HIGH',
        correlationId: requestId,
        sessionId,
        payload: { requestId, sessionId, stage: 'Generating Components' }
      });
    } else if (selectedAgent.id === 'executor-agent') {
      await globalKairoEventBus.publish({
        eventId: `evt-exec-start-${Date.now()}`,
        eventType: 'FileWriteStarted',
        timestamp: Date.now(),
        source: 'ExecutorAgent',
        priority: 'HIGH',
        correlationId: requestId,
        sessionId,
        payload: { requestId, sessionId, stage: 'Writing Files to Workspace' }
      });
    }

    try {
      const result = await this.runtime.dispatchTask(task);
      task.status = 'completed';
      task.result = result;

      // Granular Stage Completion Events
      if (selectedAgent.id === 'requirement-agent') {
        await globalKairoEventBus.publish({
          eventId: `evt-req-done-${Date.now()}`,
          eventType: 'RequirementAnalysisCompleted',
          timestamp: Date.now(),
          source: 'RequirementAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Requirements Analyzed' }
        });
      } else if (selectedAgent.id === 'architecture-agent') {
        await globalKairoEventBus.publish({
          eventId: `evt-arch-done-${Date.now()}`,
          eventType: 'ArchitectureGenerationCompleted',
          timestamp: Date.now(),
          source: 'ArchitectureAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Architecture Designed' }
        });
      } else if (selectedAgent.id === 'planner-agent') {
        await globalKairoEventBus.publish({
          eventId: `evt-plan-done-${Date.now()}`,
          eventType: 'ImplementationPlanCompleted',
          timestamp: Date.now(),
          source: 'PlannerAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Implementation Plan Built' }
        });
      } else if (selectedAgent.id === 'generator-sdk-agent' || selectedAgent.id === 'generator-agent') {
        await globalKairoEventBus.publish({
          eventId: `evt-gen-done-${Date.now()}`,
          eventType: 'GenerationCompleted',
          timestamp: Date.now(),
          source: 'GeneratorAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Generation Completed' }
        });
      } else if (selectedAgent.id === 'executor-agent') {
        await globalKairoEventBus.publish({
          eventId: `evt-fw-done-${Date.now()}`,
          eventType: 'FileWriteCompleted',
          timestamp: Date.now(),
          source: 'ExecutorAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Files Written to Workspace' }
        });
        await globalKairoEventBus.publish({
          eventId: `evt-fv-start-${Date.now()}`,
          eventType: 'FileValidationStarted',
          timestamp: Date.now(),
          source: 'ExecutorAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Running Validation' }
        });
        await globalKairoEventBus.publish({
          eventId: `evt-fv-done-${Date.now()}`,
          eventType: 'FileValidationCompleted',
          timestamp: Date.now(),
          source: 'ExecutorAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Validation Completed' }
        });
      } else if (selectedAgent.id === 'reviewer-agent') {
        await globalKairoEventBus.publish({
          eventId: `evt-exec-done-${Date.now()}`,
          eventType: 'ExecutionCompleted',
          timestamp: Date.now(),
          source: 'ReviewerAgent',
          priority: 'HIGH',
          correlationId: requestId,
          sessionId,
          payload: { requestId, sessionId, stage: 'Execution Completed' }
        });
      }

      // STAGE 3: TASK COMPLETED
      this.emitLog({
        stage: 'TASK_COMPLETED',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Task '${task.id}' completed successfully by agent '${selectedAgent.id}'`,
        details: {
          taskId: task.id,
          agentId: selectedAgent.id,
          executionTimeMs: Date.now() - startTime,
          result
        }
      });

      return result;
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      task.status = 'failed';
      task.error = errorMsg;

      // STAGE 4: TASK FAILED
      this.emitLog({
        stage: 'TASK_FAILED',
        timestamp: Date.now(),
        status: 'FAILED',
        message: `Task '${task.id}' failed on agent '${selectedAgent.id}': ${errorMsg}`,
        details: {
          taskId: task.id,
          agentId: selectedAgent.id,
          error: errorMsg,
          executionTimeMs: Date.now() - startTime
        }
      });

      throw err;
    }
  }

  /**
   * Forwards a series of tasks to appropriate downstream agents.
   * Supports optional parallel task execution mode ({ parallel: true }).
   */
  public async dispatchWorkflowTasks(
    tasks: AgentTask[],
    options?: { parallel?: boolean }
  ): Promise<{
    completedCount: number;
    failedCount: number;
    results: any[];
    errors: string[];
  }> {
    console.log('[TRACE] [AgentManager] ENTER: dispatchWorkflowTasks. Total Tasks:', tasks.length);
    let completedCount = 0;
    let failedCount = 0;
    const results: any[] = [];
    const errors: string[] = [];

    if (options?.parallel) {
      // Parallel execution mode using Promise.allSettled
      const dispatchPromises = tasks.map(async (task) => {
        try {
          const res = await this.dispatchTask(task);
          return { taskId: task.id, agentId: task.assignedAgentId, success: true, result: res };
        } catch (err: any) {
          const errorMsg = `Task '${task.id}' failed on agent '${task.assignedAgentId}': ${err.message || String(err)}`;
          return { taskId: task.id, agentId: task.assignedAgentId, success: false, error: errorMsg };
        }
      });

      const settledResults = await Promise.allSettled(dispatchPromises);
      for (const item of settledResults) {
        if (item.status === 'fulfilled') {
          const val = item.value;
          if (val.success) {
            completedCount++;
            results.push(val);
          } else {
            failedCount++;
            errors.push(val.error!);
            results.push(val);
          }
        } else {
          failedCount++;
          const errorMsg = String(item.reason);
          errors.push(errorMsg);
          results.push({ success: false, error: errorMsg });
        }
      }
    } else {
      // Sequential execution mode preserving dependency order
      const contextData: Record<string, any> = {};
      for (const task of tasks) {
        task.payload = {
          ...task.payload,
          ...contextData
        };
        try {
          const result = await this.dispatchTask(task);
          completedCount++;
          
          // Map index/stage to results payload
          const taskSuffix = task.id.split('-').pop() || '';
          if (taskSuffix === '1') {
            contextData.requirementResult = result;
          } else if (taskSuffix === '2') {
            contextData.intelligenceResult = result;
          } else if (taskSuffix === '3') {
            contextData.decisionResult = result;
          } else if (taskSuffix === '4') {
            contextData.architectureResult = result;
          } else if (taskSuffix === '5') {
            contextData.workspaceResult = result;
          } else if (taskSuffix === '6') {
            contextData.manifestResult = result;
          } else if (taskSuffix === '7') {
            contextData.plannerResult = result;
          } else if (taskSuffix === '8') {
            contextData.sdkResult = result;
          } else if (taskSuffix === '9') {
            contextData.executorResult = result;
          } else if (taskSuffix === '10') {
            contextData.reviewerResult = result;
          }

          if (task.payload.taskType) {
            contextData[task.payload.taskType] = result;
          }
          contextData[task.assignedAgentId] = result;

          results.push({ taskId: task.id, agentId: task.assignedAgentId, success: true, result });
        } catch (err: any) {
          failedCount++;
          const errorMsg = `Task '${task.id}' failed on agent '${task.assignedAgentId}': ${err.message || String(err)}`;
          errors.push(errorMsg);
          results.push({ taskId: task.id, agentId: task.assignedAgentId, success: false, error: errorMsg });
          break; // Stop execution of downstream tasks on task failure
        }
      }
    }

    const finalResult = {
      completedCount,
      failedCount,
      results: results as any,
      errors: errors as any
    };
    console.log('[TRACE] [AgentManager] EXIT: dispatchWorkflowTasks completed. Completed:', completedCount, 'Failed:', failedCount);
    return finalResult;
  }

  /**
   * Returns list of all registered agent definitions.
   */
  public getRegisteredAgents(): AgentDefinition[] {
    return this.registry.list().map(a => a.definition);
  }

  /**
   * Returns live agent monitor metrics.
   */
  public getMonitorStats(): any[] {
    return this.runtime.getMonitorStats();
  }
}

export const agentManager = new AgentManager();
export default agentManager;

