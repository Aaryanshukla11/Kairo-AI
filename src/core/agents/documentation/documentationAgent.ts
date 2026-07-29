import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { DocumentationBrain } from './documentationBrain';
import { DocumentationEvents } from './documentationEvents';
import { documentationMetrics } from './documentationMetrics';
import { DocEventType } from './documentationTypes';

export class DocumentationAgent extends BaseAgent {
  private events = new DocumentationEvents();
  public brain: DocumentationBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new DocumentationBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'GENERATE_DOCS') {
        const report = await this.brain.runDocumentationWorkflow(task.payload.gitChanges || []);
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: documentationMetrics.getMetrics() };
      } else {
        throw new Error(`DocumentationAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: documentationMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(DocEventType.DocumentationCompleted, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
