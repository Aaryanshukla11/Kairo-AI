import { PlannerEngine } from './PlannerEngine';
import { PlannerRegistry } from './PlannerRegistry';

export class PlannerDispatcher {
  private engine: PlannerEngine;
  private registry: PlannerRegistry;

  constructor() {
    this.engine = new PlannerEngine();
    this.registry = PlannerRegistry.getInstance();
  }

  /**
   * Receives output from Prompt Pipeline.
   * Routes into PlannerEngine and registers the plan.
   * Future AI integration point.
   */
  public async dispatch(sessionId: string, promptId: string, promptText: string, contextSnapshot: any): Promise<void> {
    const plan = this.engine.generatePlan(sessionId, promptId, promptText, contextSnapshot);
    this.registry.register(plan);
    
    // Future: Broadcast PLAN_READY via messageRouter -> webview
  }
}
