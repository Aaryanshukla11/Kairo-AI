import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { ExecutionCoordinator } from './executionCoordinator';
import { executionValidator } from './executionValidator';
import { executionMetrics } from './executionMetrics';
import { ExecutionEvents } from './executionEvents';
import { ExecutorEventType } from './executorTypes';

export class ExecutorAgent extends BaseAgent {
  private events = new ExecutionEvents();
  private coordinator: ExecutionCoordinator;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.coordinator = new ExecutionCoordinator(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  /**
   * Main entry point to run tasks.
   */
  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;

    try {
      const plan = task.payload.plan;

      executionValidator.validateApproval(plan);

      const report = await this.coordinator.executePlan(plan);

      const success = report.failedTasks.length === 0;
      
      executionMetrics.recordExecutionRun(report.executionTimeMs, report.toolUsage.length, success);

      this.status = success ? AgentStatus.Completed : AgentStatus.Failed;

      return {
        success,
        report,
        metrics: executionMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(ExecutorEventType.TaskFailed, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
