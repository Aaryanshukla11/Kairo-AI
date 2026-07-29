import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { DependencyBrain } from './dependencyBrain';
import { DependencyEvents } from './dependencyEvents';
import { dependencyMetrics } from './dependencyMetrics';
import { DepEventType } from './dependencyTypes';

export class DependencyAgent extends BaseAgent {
  private events = new DependencyEvents();
  public brain: DependencyBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new DependencyBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'ANALYZE_DEPENDENCIES') {
        const report = await this.brain.runDependencyAnalysis(task.payload.packageJsonPath || '');
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: dependencyMetrics.getMetrics() };
      } else {
        throw new Error(`DependencyAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: dependencyMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(DepEventType.DependencyAnalysisCompleted, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
