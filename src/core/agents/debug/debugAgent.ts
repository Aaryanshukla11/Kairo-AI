import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { DebugBrain } from './debugBrain';
import { DebugEvents } from './debugEvents';
import { debugMetrics } from './debugMetrics';
import { DebugEventType } from './debugTypes';

export class DebugAgent extends BaseAgent {
  private events = new DebugEvents();
  public brain: DebugBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new DebugBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'ANALYZE_FAILURE') {
        const report = await this.brain.runFailureAnalysis(task.payload.diagnostics);
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: debugMetrics.getMetrics() };
      } else {
        throw new Error(`DebugAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: debugMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(DebugEventType.DebugCompleted, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
