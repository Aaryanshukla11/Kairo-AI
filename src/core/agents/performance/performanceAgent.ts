import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { PerformanceBrain } from './performanceBrain';
import { PerformanceEvents } from './performanceEvents';
import { performanceMetrics } from './performanceMetrics';
import { PerformanceEventType } from './performanceTypes';

export class PerformanceAgent extends BaseAgent {
  private events = new PerformanceEvents();
  public brain: PerformanceBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new PerformanceBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'ANALYZE_PERFORMANCE') {
        const report = await this.brain.runProfilerAudit(task.payload.filePath || '');
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: performanceMetrics.getMetrics() };
      } else {
        throw new Error(`PerformanceAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: performanceMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(PerformanceEventType.PerformanceAnalysisCompleted, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
