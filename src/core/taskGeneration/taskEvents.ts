export type TaskGenerationEventListener = (event: { type: string; timestamp: number; payload?: any }) => void;

export class TaskEvents {
  private listeners = new Set<TaskGenerationEventListener>();

  public subscribe(listener: TaskGenerationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: string, payload?: any): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error('Error in TaskEvents listener:', err);
      }
    }
  }
}
export const taskEvents = new TaskEvents();
