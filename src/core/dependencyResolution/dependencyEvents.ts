export type DependencyEventType =
  | 'ResolutionStarted'
  | 'DiscoveryCompleted'
  | 'CyclesChecked'
  | 'OptimizationCompleted'
  | 'ResolutionCompleted';

export interface DependencyEvent {
  type: DependencyEventType;
  timestamp: number;
  payload?: any;
}

export type DependencyEventListener = (event: DependencyEvent) => void;

export class DependencyEvents {
  private listeners = new Set<DependencyEventListener>();

  public subscribe(listener: DependencyEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: DependencyEventType, payload?: any): void {
    const event: DependencyEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[DependencyEvents] Error in event listener:', err);
      }
    }
  }
}

export const dependencyEvents = new DependencyEvents();
