import { inferenceEvents } from './inferenceEvents';
import { InferenceEventType } from './inferenceTypes';

export class CancellationManager {
  private activeControllers = new Map<string, AbortController>();

  public register(sessionId: string): AbortSignal {
    const controller = new AbortController();
    this.activeControllers.set(sessionId, controller);
    return controller.signal;
  }

  public cancel(sessionId: string): void {
    const controller = this.activeControllers.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(sessionId);
      inferenceEvents.emit(InferenceEventType.InferenceCancelled, sessionId);
    }
  }

  public remove(sessionId: string): void {
    this.activeControllers.delete(sessionId);
  }
}

export const cancellationManager = new CancellationManager();
