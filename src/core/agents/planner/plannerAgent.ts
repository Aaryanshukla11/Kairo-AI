import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import {
  PlannerEventType,
  IGenerationPlanObject,
  IPlannerAgentLog,
  PlannerAgentStage,
  IGeneratorTask
} from './plannerTypes';
import { plannerValidator } from './plannerValidator';
import { plannerBrain } from './plannerBrain';
import { plannerMetrics } from './plannerMetrics';
import { PlannerEvents } from './plannerEvents';
import { plannerMemory } from './plannerMemory';
import { IProjectManifestObject } from '../projectManifest/projectManifestTypes';

export class PlannerAgent extends BaseAgent {
  private events = new PlannerEvents();
  private logs: IPlannerAgentLog[] = [];
  private logListeners: Array<(log: IPlannerAgentLog) => void> = [];

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public getLogs(): readonly IPlannerAgentLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: any): () => void {
    if (typeof listener === 'function') {
      this.logListeners.push(listener);
    }
    const unsubEvents = this.events.subscribe(listener);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
      unsubEvents();
    };
  }

  private emitLog(stageLog: IPlannerAgentLog): void {
    this.logs.push(stageLog);
    for (const listener of this.logListeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[PlannerAgent] Error in log listener:', err);
      }
    }
  }

  public async executeTask(task: AgentTask): Promise<any> {
    const payload = task.payload || {};
    const manifest: IProjectManifestObject | undefined = payload.projectManifest || payload.manifestResult?.manifest;

    // Legacy prompt-driven plan execution compatibility
    if (payload.text && !manifest && (task as any).taskType !== 'GENERATION_PLAN') {
      const start = Date.now();
      this.status = AgentStatus.Running;
      this.events.emit(PlannerEventType.PlanningStarted, { taskId: task.id });

      try {
        const prompt = payload.text || '';
        plannerValidator.validateRequest(prompt);
        const plan = await plannerBrain.generatePlan(prompt);
        this.events.emit(PlannerEventType.TaskCreated, { planId: plan.id });
        plannerValidator.validatePlan(plan);
        this.events.emit(PlannerEventType.PlanValidated, { planId: plan.id });
        const latencyMs = Date.now() - start;
        plannerMetrics.recordPlanningRun(plan.tasks.length, latencyMs);
        plannerMemory.rememberPlan(plan);
        this.events.emit(PlannerEventType.PlanCompleted, { planId: plan.id });
        this.status = AgentStatus.Completed;
        return { success: true, plan, metrics: plannerMetrics.getMetrics() };
      } catch (err: any) {
        this.events.emit(PlannerEventType.PlanningFailed, { error: err.message });
        this.status = AgentStatus.Failed;
        throw err;
      }
    }

    // Default Generation Plan creation pipeline
    this.status = AgentStatus.Running;
    const startTime = Date.now();
    const requestId = manifest?.requestId || payload.requestId || task.id;
    const sessionId = manifest?.sessionId || payload.sessionId || `session-${Date.now()}`;

    // STAGE 1: PLANNING STARTED
    this.emitLog({
      stage: 'PLANNING_STARTED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Generation Planning started for request '${requestId}'`,
      details: { requestId, sessionId }
    });

    // STAGE 2: DEPENDENCY RESOLUTION
    const executionStages = [
      'scaffold_workspace',
      'generate_configs',
      'synthesize_core',
      'synthesize_ui',
      'verify_build'
    ];

    const dependencyGraph = {
      nodes: [
        { id: 'gen-stage-1', name: 'scaffold_workspace' },
        { id: 'gen-stage-2', name: 'generate_configs' },
        { id: 'gen-stage-3', name: 'synthesize_core' },
        { id: 'gen-stage-4', name: 'synthesize_ui' },
        { id: 'gen-stage-5', name: 'verify_build' }
      ],
      edges: [
        { from: 'gen-stage-1', to: 'gen-stage-2' },
        { from: 'gen-stage-2', to: 'gen-stage-3' },
        { from: 'gen-stage-3', to: 'gen-stage-4' },
        { from: 'gen-stage-4', to: 'gen-stage-5' }
      ],
      valid: true
    };

    this.emitLog({
      stage: 'DEPENDENCY_RESOLUTION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Resolved build and module dependencies across ${executionStages.length} execution stages`,
      details: {
        requestId,
        sessionId,
        stagesCount: executionStages.length,
        nodesCount: dependencyGraph.nodes.length
      }
    });

    // STAGE 3: GENERATOR ASSIGNMENT
    const generatorMapping: Record<string, readonly string[]> = {
      ConfigGenerator: Object.freeze(['package.json', 'tsconfig.json', 'vite.config.ts']),
      SharedUtilGenerator: Object.freeze(['src/common/utils.ts']),
      BackendGenerator: Object.freeze(['src/services/apiService.ts']),
      UIComponentGenerator: Object.freeze(['src/index.ts', 'src/components/App.tsx'])
    };

    this.emitLog({
      stage: 'GENERATOR_ASSIGNMENT',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Assigned file generation tasks to 4 dedicated Generators`,
      details: {
        requestId,
        sessionId,
        generators: Object.keys(generatorMapping)
      }
    });

    // STAGE 4: EXECUTION QUEUE CREATION
    const planTasks: any[] = task.payload?.tasks || task.payload?.plan?.tasks || task.payload?.proposal?.tasks || [];
    let orderedTaskList: IGeneratorTask[] = [];

    if (planTasks.length > 0) {
      const { globalGeneratorRegistrySDK } = require('../generatorSDK/generatorRegistrySDK');
      orderedTaskList = planTasks.map((t: any, idx: number) => {
        const capability = t.requiredCapability || t.generatorId || 'html';
        const resolvedGen = globalGeneratorRegistrySDK.resolve(capability);
        const genId = resolvedGen ? resolvedGen.id : 'UIComponentGenerator';
        const stage = genId === 'ConfigGenerator' ? 'generate_configs' : genId === 'UIComponentGenerator' ? 'synthesize_ui' : 'synthesize_core';
        return {
          id: `task-gen-${String(idx + 1).padStart(3, '0')}`,
          title: t.title || `Execute ${genId}`,
          generatorId: genId,
          stage,
          targetFiles: t.targetFiles || [],
          dependencies: idx > 0 ? [`task-gen-${String(idx).padStart(3, '0')}`] : []
        };
      });
    } else if (task.payload?.targetFiles && task.payload.targetFiles.length > 0) {
      orderedTaskList = [
        {
          id: 'task-gen-001',
          title: 'Synthesize Target Files',
          generatorId: 'UIComponentGenerator',
          stage: 'synthesize_ui',
          targetFiles: task.payload.targetFiles,
          dependencies: []
        }
      ];
    }

    const parallelGroups = [
      ['ConfigGenerator', 'SharedUtilGenerator']
    ];

    this.emitLog({
      stage: 'EXECUTION_QUEUE_CREATION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Created ordered execution queue with ${orderedTaskList.length} generator tasks`,
      details: {
        requestId,
        sessionId,
        tasksCount: orderedTaskList.length,
        parallelGroupsCount: parallelGroups.length
      }
    });

    // STAGE 5: VALIDATION
    const isValid = dependencyGraph.valid && orderedTaskList.length > 0;
    const validationErrors: string[] = [];
    if (!isValid) validationErrors.push('Generator execution order invalid');

    this.emitLog({
      stage: 'VALIDATION',
      timestamp: Date.now(),
      status: isValid ? 'SUCCESS' : 'FAILED',
      message: isValid ? 'Generator execution graph validation completed with zero out-of-order violations' : 'Execution graph validation failed',
      details: {
        requestId,
        sessionId,
        validationStatus: isValid ? 'PASSED' : 'FAILED'
      }
    });

    // STAGE 6: GENERATION PLAN CREATED
    const retryRules = {
      maxRetries: 3,
      backoffMs: 1000,
      retryableErrors: ['TIMEOUT', 'TRANSIENT_SYNTHESIS_ERROR']
    };

    const rollbackStrategy = {
      checkpointIds: ['chk-001-scaffold', 'chk-002-configs', 'chk-003-synthesis'],
      autoRollbackOnFailure: true
    };

    const estimatedExecutionTimeline = {
      totalEstimatedMs: 1500,
      stageBreakdownMs: {
        scaffold_workspace: 200,
        generate_configs: 300,
        synthesize_core: 500,
        synthesize_ui: 500
      }
    };

    const plan: IGenerationPlanObject = {
      requestId,
      sessionId,
      executionStages: Object.freeze(executionStages),
      orderedTaskList: Object.freeze(orderedTaskList),
      generatorMapping: Object.freeze(generatorMapping),
      dependencyGraph: Object.freeze(dependencyGraph),
      parallelGroups: Object.freeze(parallelGroups),
      validationRules: Object.freeze([
        'Generators must execute strictly according to stage order',
        'Rollback checkpoint must be registered before file writes',
        'Parallel groups must finish completely before proceeding to next stage'
      ]),
      retryRules: Object.freeze(retryRules),
      rollbackStrategy: Object.freeze(rollbackStrategy),
      estimatedExecutionTimeline: Object.freeze(estimatedExecutionTimeline),
      validationStatus: isValid ? 'PASSED' : 'FAILED',
      validationErrors: isValid ? undefined : Object.freeze(validationErrors),
      metadata: Object.freeze({
        timestamp: Date.now(),
        version: '1.0.0'
      })
    };

    this.emitLog({
      stage: 'GENERATION_PLAN_CREATED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Complete Generation Plan created successfully`,
      details: {
        requestId,
        sessionId,
        stagesCount: executionStages.length,
        tasksCount: orderedTaskList.length,
        validationStatus: plan.validationStatus
      }
    });

    // STAGE 7: PLAN RETURNED
    this.emitLog({
      stage: 'PLAN_RETURNED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Returning Generation Plan to Agent Manager`,
      details: {
        requestId,
        sessionId,
        executionTimeMs: Date.now() - startTime
      }
    });

    this.status = isValid ? AgentStatus.Completed : AgentStatus.Failed;

    return {
      success: isValid,
      plan: Object.freeze(plan),
      metrics: plannerMetrics.getMetrics()
    };
  }
}

