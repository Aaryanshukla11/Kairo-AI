import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { PlannerEventType } from './plannerTypes';
import { plannerValidator } from './plannerValidator';
import { plannerBrain } from './plannerBrain';
import { plannerMetrics } from './plannerMetrics';
import { PlannerEvents } from './plannerEvents';
import { plannerMemory } from './plannerMemory';

export class PlannerAgent extends BaseAgent {
  private events = new PlannerEvents();

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public subscribe(listener: any): () => void {
    return this.events.subscribe(listener);
  }

  /**
   * Main entry point to compile plans.
   */
  public async executeTask(task: AgentTask): Promise<any> {
    const start = Date.now();
    this.status = AgentStatus.Running;
    this.events.emit(PlannerEventType.PlanningStarted, { taskId: task.id });

    try {
      const prompt = task.payload.text || '';
      
      plannerValidator.validateRequest(prompt);

      const plan = await plannerBrain.generatePlan(prompt);
      this.events.emit(PlannerEventType.TaskCreated, { planId: plan.id });

      plannerValidator.validatePlan(plan);
      this.events.emit(PlannerEventType.PlanValidated, { planId: plan.id });

      const latencyMs = Date.now() - start;
      
      plannerMetrics.recordPlanningRun(plan.tasks.length, latencyMs);
      plannerMemory.rememberPlan(plan);

      this.events.emit(PlannerEventType.PlanCompleted, { planId: plan.id });
      this.status = AgentStatus.Completed;

      return {
        success: true,
        plan,
        metrics: plannerMetrics.getMetrics()
      };
    } catch (err: any) {
      this.events.emit(PlannerEventType.PlanningFailed, { error: err.message });
      this.status = AgentStatus.Failed;
      throw err;
    }
  }
}
