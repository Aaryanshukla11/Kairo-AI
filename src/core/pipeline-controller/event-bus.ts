import { IPipelineEvent } from './types';

export type PipelineEventHandler = (event: IPipelineEvent) => void;

export class PipelineEventBus {
  private handlers: Map<string, Set<PipelineEventHandler>> = new Map();

  public subscribe(eventType: string, handler: PipelineEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  public unsubscribe(eventType: string, handler: PipelineEventHandler): void {
    if (this.handlers.has(eventType)) {
      this.handlers.get(eventType)!.delete(handler);
    }
  }

  public emit(event: IPipelineEvent): void {
    const eventTypeHandlers = this.handlers.get(event.eventType);
    if (eventTypeHandlers) {
      for (const handler of eventTypeHandlers) {
        try {
          handler(event);
        } catch (err) {
          // Suppress handler errors to prevent pipeline crashing
        }
      }
    }
    
    // Broadcast all wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          handler(event);
        } catch (err) {}
      }
    }
  }

  public clear(): void {
    this.handlers.clear();
  }
}

export const pipelineEventBus = new PipelineEventBus();
export default pipelineEventBus;
