import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { RefactoringBrain } from './refactoringBrain';
import { RefactoringEvents } from './refactoringEvents';
import { refactoringMetrics } from './refactoringMetrics';
import { RefactorEventType } from './refactoringTypes';

export class RefactoringAgent extends BaseAgent {
  private events = new RefactoringEvents();
  public brain: RefactoringBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new RefactoringBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'ANALYZE_SMELLS') {
        const report = await this.brain.runRefactoringAnalysis(task.payload.files || []);
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: refactoringMetrics.getMetrics() };
      } else {
        throw new Error(`RefactoringAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: refactoringMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(RefactorEventType.RefactoringCompleted, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
