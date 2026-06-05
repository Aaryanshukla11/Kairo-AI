export type ExecutionPlanningEventListener = (event: { type: string; timestamp: number; payload?: any }) => void;

export class ExecutionEvents {
  private listeners = new Set<ExecutionPlanningEventListener>();

  public subscribe(listener: ExecutionPlanningEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: string, payload?: any): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error('Error in ExecutionEvents listener:', err);
      }
    }
  }
}
export const executionEvents = new ExecutionEvents();
