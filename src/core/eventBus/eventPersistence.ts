import { AIIdleEvent } from './eventTypes';

export class EventPersistence {
  private log: AIIdleEvent[] = [];

  public save(event: AIIdleEvent): void {
    this.log.push({ ...event });
  }

  public getHistory(workflowId?: string): AIIdleEvent[] {
    if (workflowId) {
      return this.log.filter(e => e.workflowId === workflowId);
    }
    return [...this.log];
  }

  public clear(): void {
    this.log = [];
  }
}
export const eventPersistence = new EventPersistence();
