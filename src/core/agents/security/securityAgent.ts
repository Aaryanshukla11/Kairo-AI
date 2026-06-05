import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { SecurityBrain } from './securityBrain';
import { SecurityEvents } from './securityEvents';
import { securityMetrics } from './securityMetrics';
import { SecurityEventType } from './securityTypes';

export class SecurityAgent extends BaseAgent {
  private events = new SecurityEvents();
  public brain: SecurityBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new SecurityBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'SCAN_PLAN') {
        const report = await this.brain.scanPlanWorkflow(task.payload.plan);
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: securityMetrics.getMetrics() };
      } else {
        throw new Error(`SecurityAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: securityMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(SecurityEventType.SecurityFailed, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
