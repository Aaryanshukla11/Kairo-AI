import { ASTEvent, ASTEventType, ASTEventListener } from './astTypes';

export class ASTEvents {
  private listeners = new Set<ASTEventListener>();

  public subscribe(listener: ASTEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emit(type: ASTEventType, payload?: any): void {
    const event: ASTEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in AST Generation Engine event listener:', err);
      }
    }
  }
}

export const astEvents = new ASTEvents();
