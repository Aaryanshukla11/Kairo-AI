import { ModelState, RuntimeEventType } from './runtimeTypes';
import { runtimeEvents } from './runtimeEvents';

export class RuntimeLifecycle {
  private state: ModelState = ModelState.Registered;

  public transition(newState: ModelState, modelId?: string, payload?: any): void {
    const oldState = this.state;
    if (oldState === newState) return;

    this.state = newState;

    // Map state transitions to events
    let eventType: RuntimeEventType | null = null;
    switch (newState) {
      case ModelState.Loading:
        eventType = RuntimeEventType.ModelLoading;
        break;
      case ModelState.Loaded:
        eventType = RuntimeEventType.ModelLoaded;
        break;
      case ModelState.Ready:
        eventType = RuntimeEventType.ModelReady;
        break;
      case ModelState.Running:
        eventType = RuntimeEventType.InferenceStarted;
        break;
      case ModelState.Idle:
        // Treat idle transition similarly to model ready
        eventType = RuntimeEventType.ModelReady;
        break;
      case ModelState.Unloading:
        eventType = RuntimeEventType.ModelUnloading;
        break;
      case ModelState.Failed:
        eventType = RuntimeEventType.RuntimeError;
        break;
    }

    if (eventType) {
      runtimeEvents.emit(eventType, modelId, {
        previousState: oldState,
        currentState: newState,
        ...payload
      });
    }
  }

  public getState(): ModelState {
    return this.state;
  }

  public reset(): void {
    this.state = ModelState.Registered;
  }
}

export const runtimeLifecycle = new RuntimeLifecycle();
