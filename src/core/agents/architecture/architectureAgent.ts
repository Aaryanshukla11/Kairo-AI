import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { ArchitectureBrain } from './architectureBrain';
import { ArchitectureEvents } from './architectureEvents';
import { architectureMetrics } from './architectureMetrics';
import { ArchEventType } from './architectureTypes';

export class ArchitectureAgent extends BaseAgent {
  private events = new ArchitectureEvents();
  public brain: ArchitectureBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new ArchitectureBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'ANALYZE_ARCHITECTURE') {
        const report = await this.brain.runArchitectureAnalysis(task.payload.filesMap || {});
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: architectureMetrics.getMetrics() };
      } else {
        throw new Error(`ArchitectureAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: architectureMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(ArchEventType.ArchitectureAnalysisCompleted, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
