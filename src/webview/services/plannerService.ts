import { vscodeBridge } from './vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';

export class PlannerService {
  /**
   * Triggers a request to generate a plan for a validated prompt.
   */
  public async generatePlan(sessionId: string, promptId: string): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN, // To be mapped to PLAN_GENERATION_REQUEST in protocol later
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GENERATE_PLAN', sessionId, promptId },
      version: '1.0.0' as any
    });
  }

  /**
   * Retrieves a generated plan from the backend registry.
   */
  public async getPlan(planId: string): Promise<void> {
    vscodeBridge.postMessage({
      type: MessageType.UNKNOWN,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_PLAN', planId },
      version: '1.0.0' as any
    });
  }
}

export const plannerService = new PlannerService();
