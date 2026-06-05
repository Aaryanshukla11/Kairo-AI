import { eventPersistence } from './eventPersistence';
import { eventBusInstance } from './eventBus';

export class EventReplay {
  public async replay(workflowId: string): Promise<number> {
    const history = eventPersistence.getHistory(workflowId);
    let count = 0;
    for (const event of history) {
      await eventBusInstance.publish({
        ...event,
        eventId: `EV-REPLAY-${event.eventId}-${Date.now()}`,
        timestamp: Date.now()
      });
      count++;
    }
    return count;
  }
}
export const eventReplay = new EventReplay();
