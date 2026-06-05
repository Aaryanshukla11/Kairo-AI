import {
  WorkflowCoordinatorInput,
  WorkflowCoordinatorReport,
  WorkflowState,
  WorkflowStrategyType
} from './workflowTypes';
import { workflowEngine } from './workflowEngine';
import { workflowContextManager } from './workflowContext';
import { workflowQueueManager } from './workflowQueue';
import { workflowRegistry } from './workflowRegistry';
import { workflowScheduler } from './workflowScheduler';
import { workflowLifecycleManager } from './workflowLifecycle';
import { workflowPolicyManager } from './workflowPolicyManager';
import { workflowValidator } from './workflowValidator';
import { workflowExecutor } from './workflowExecutor';
import { workflowMetricsCollector } from './workflowMetrics';
import { workflowEvents, WorkflowEventType } from './workflowEvents';
import { SequentialWorkflowStrategy, ParallelWorkflowStrategy, ConditionalWorkflowStrategy, RecoveryWorkflowStrategy, ApprovalWorkflowStrategy } from './strategies';

export class WorkflowCoordinator {
  private sequential = new SequentialWorkflowStrategy();
  private parallel = new ParallelWorkflowStrategy();
  private conditional = new ConditionalWorkflowStrategy();
  private recovery = new RecoveryWorkflowStrategy();
  private approval = new ApprovalWorkflowStrategy();

  async coordinate(input: WorkflowCoordinatorInput = {}): Promise<WorkflowCoordinatorReport> {
    const workflowId = input.workflowId || `WF-${Date.now()}`;
    const timestamp = Date.now();

    // 1. Receive Request & Initialize Workflow Context
    const context = workflowContextManager.createContext(workflowId, input.context || {});
    workflowEvents.emitEvent(WorkflowEventType.WORKFLOW_CREATED, { timestamp, workflowId });

    // 2. Build Stages
    const stages = workflowEngine.buildStages(input);

    // 3. Resolve Dependencies & Execution Order
    const executionOrder = stages.map(s => s.id); // Sequential topological order

    // 4. Assign Strategy & Build Graph
    const strategyType = input.strategy || WorkflowStrategyType.Parallel;
    let graph;
    switch (strategyType) {
      case WorkflowStrategyType.Sequential:
        graph = this.sequential.apply(stages, executionOrder);
        break;
      case WorkflowStrategyType.Conditional:
        graph = this.conditional.apply(stages, executionOrder);
        break;
      case WorkflowStrategyType.Recovery:
        graph = this.recovery.apply(stages, executionOrder);
        break;
      case WorkflowStrategyType.Approval:
        graph = this.approval.apply(stages, executionOrder);
        break;
      case WorkflowStrategyType.Parallel:
      default:
        graph = this.parallel.apply(stages, executionOrder);
        break;
    }

    graph.id = workflowId;
    workflowRegistry.register(graph);

    // 5. Enqueue & Schedule
    workflowLifecycleManager.transition(workflowId, WorkflowState.Created, WorkflowState.Queued);
    workflowQueueManager.enqueue(workflowId, input.queueType);
    workflowLifecycleManager.transition(workflowId, WorkflowState.Queued, WorkflowState.Scheduled);

    // 6. Evaluate Policies
    const policyEval = workflowPolicyManager.evaluatePolicies();

    // 7. Dispatch & Execute
    workflowLifecycleManager.transition(workflowId, WorkflowState.Scheduled, WorkflowState.Running);
    const { timeline, retries } = await workflowExecutor.execute(graph);
    workflowLifecycleManager.transition(workflowId, WorkflowState.Running, WorkflowState.Completed);

    // 8. Validate Completion
    const validationResult = workflowValidator.validate(graph);

    // 9. Collect Metrics
    const metrics = workflowMetricsCollector.recordWorkflowRun(stages, retries.length);

    const report: WorkflowCoordinatorReport = {
      reportId: `WFR-${timestamp}`,
      workflowId,
      timestamp,
      graph,
      context,
      executionQueue: workflowQueueManager.getQueue(),
      executionTimeline: timeline,
      retries,
      policyRules: policyEval.rules,
      executionConfidence: validationResult.valid ? metrics.avgConfidence : 0.5,
      metrics,
      validationResult
    };

    if (validationResult.valid) {
      workflowEvents.emitEvent(WorkflowEventType.WORKFLOW_COMPLETED, { timestamp, workflowId, report });
    } else {
      workflowEvents.emitEvent(WorkflowEventType.WORKFLOW_FAILED, { timestamp, workflowId, report, error: validationResult.errors.join('; ') });
    }

    return report;
  }
}

export const workflowCoordinator = new WorkflowCoordinator();
