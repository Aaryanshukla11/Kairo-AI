import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { TestingBrain } from './testingBrain';
import { TestingEvents } from './testingEvents';
import { testingMetrics } from './testingMetrics';
import { TestingEventType } from './testingTypes';

export class TestingAgent extends BaseAgent {
  private events = new TestingEvents();
  public brain: TestingBrain;

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new TestingBrain(this.events);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    try {
      let result;
      if (action === 'RUN_WORKFLOW') {
        const report = await this.brain.runTestingWorkflow(
          task.payload.executionReport,
          task.payload.framework || 'simulated'
        );
        result = { report };
      } else if (action === 'GET_STATS') {
        result = { metrics: testingMetrics.getMetrics() };
      } else {
        throw new Error(`TestingAgent error: Unknown action "${action}"`);
      }

      this.status = AgentStatus.Completed;
      return {
        success: true,
        result,
        metrics: testingMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(TestingEventType.TestFailed, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
