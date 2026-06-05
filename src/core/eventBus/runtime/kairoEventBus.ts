import { IKairoEvent, KairoEventType, IEventValidationResult } from './kairoEventBusTypes';
import { eventEvents } from '../eventEvents';

export class KairoEventBus {
  private history: IKairoEvent[] = [];
  private eventIds = new Set<string>();
  private handlers = new Map<string, Array<(event: IKairoEvent) => Promise<void>>>();
  private knownEventTypes = new Set<string>([
    'PromptReceived',
    'IntentDetected',
    'PlanningStarted',
    'PlanningCompleted',
    'ArchitectureReady',
    'ApprovalRequired',
    'ApprovalGranted',
    'RequirementCompleted',
    'ArchitectureCompleted',
    'WorkspaceCompleted',
    'ManifestCompleted',
    'GenerationStarted',
    'GeneratorStarted',
    'GeneratorCompleted',
    'FileGenerated',
    'GenerationCompleted',
    'ExecutionStarted',
    'ExecutionCompleted',
    'ExecutionFailed',
    'ReviewUpdated',
    'ProjectCompleted'
  ]);

  public validateEvent(event: IKairoEvent): IEventValidationResult {
    if (!event || !event.eventId || !event.eventType) {
      return { valid: false, errorType: 'INVALID_PAYLOAD', message: 'Event structure or mandatory fields missing.' };
    }

    if (this.eventIds.has(event.eventId)) {
      return { valid: false, errorType: 'DUPLICATE_EVENT', message: `Duplicate event ID '${event.eventId}'.` };
    }

    if (event.timestamp < Date.now() - 24 * 60 * 60 * 1000) {
      return { valid: false, errorType: 'DEAD_EVENT', message: 'Event timestamp is older than maximum retention.' };
    }

    // Circular loop check in correlation sequence
    if (event.payload?.causeEventId === event.eventId) {
      return { valid: false, errorType: 'CIRCULAR_EVENT', message: 'Circular event dependency detected.' };
    }

    return { valid: true };
  }

  public async publish(event: IKairoEvent): Promise<void> {
    const validation = this.validateEvent(event);
    if (!validation.valid) {
      console.error(`[EventBus][ERROR] Validation error for event '${event.eventType}': ${validation.message}`);
      throw new Error(`[KairoEventBus Validation Error] ${validation.errorType}: ${validation.message}`);
    }

    this.knownEventTypes.add(event.eventType);
    this.eventIds.add(event.eventId);
    this.history.push(event);

    const execId = event.correlationId || event.sessionId || event.eventId;
    console.log(`[EventBus][EMIT] - executionId: ${execId}, eventName: ${event.eventType}, producer: ${event.source}, timestamp: ${event.timestamp}`);

    const subscribers = this.handlers.get(event.eventType) || [];
    const wildcardSubscribers = this.handlers.get('*') || [];
    const allHandlers = [...subscribers, ...wildcardSubscribers];

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (err: any) {
        console.error(`[EventBus][ERROR] Error in subscriber for event ${event.eventType}:`, err.message || err);
      }
    }

    // Forward automatically to eventEvents so MessageRouter & VS Code Webview receive live event updates
    try {
      eventEvents.emit(event.eventType, event);
    } catch (err: any) {
      console.error(`[EventBus][ERROR] Error forwarding event '${event.eventType}' to eventEvents:`, err.message || err);
    }
  }

  public subscribe(eventType: string, handler: (event: IKairoEvent) => Promise<void>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    return () => {
      const current = this.handlers.get(eventType) || [];
      this.handlers.set(
        eventType,
        current.filter(h => h !== handler)
      );
    };
  }

  public replay(filter?: { fromTimestamp?: number }): readonly IKairoEvent[] {
    if (!filter || !filter.fromTimestamp) {
      return Object.freeze([...this.history]);
    }
    return Object.freeze(this.history.filter(e => e.timestamp >= filter.fromTimestamp!));
  }

  public getHistory(): readonly IKairoEvent[] {
    return Object.freeze([...this.history]);
  }

  public clearHistory(): void {
    this.history = [];
    this.eventIds.clear();
  }
}

export const globalKairoEventBus = new KairoEventBus();
