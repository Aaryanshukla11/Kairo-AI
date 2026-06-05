import { GitEvent, GitEventListener, GitEventType } from './gitTypes';

export class GitEvents {
  private listeners = new Set<GitEventListener>();

  /**
   * Subscribes a listener to Git repository events.
   */
  public subscribe(listener: GitEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emits a Git event.
   */
  public emit(type: GitEventType, repositoryRoot: string, payload?: any): void {
    const event: GitEvent = {
      type,
      repositoryRoot,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in Git event listener:', err);
      }
    }
  }
}
