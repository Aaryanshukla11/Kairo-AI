import { AgentEvent, AgentEventListener, AgentEventType } from './agentTypes';

export class AgentEvents {
  private listeners = new Set<AgentEventListener>();

  /**
   * Subscribes a listener to Agent Runtime events.
   */
  public subscribe(listener: AgentEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts agent lifecycle and task assignment updates.
   */
  public emit(type: AgentEventType, agentId: string, payload?: any): void {
    const event: AgentEvent = {
      type,
      agentId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in agent event listener:', err);
      }
    }
  }
}
