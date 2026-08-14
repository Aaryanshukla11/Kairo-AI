import * as assert from 'assert';
import { globalKairoEventBus } from '../../src/core/eventBus/runtime/kairoEventBus';
import { eventBusInstance } from '../../src/core/eventBus/eventBus';
import { eventEvents } from '../../src/core/eventBus/eventEvents';
import { MessageRouter } from '../../src/extension/messageRouter';
import { MessageType } from '../../src/common/protocol';

describe('Blocker #4 - Event Bus Integration Tests', () => {

  beforeEach(() => {
    globalKairoEventBus.clearHistory();
  });

  it('TEST 1 & TEST 5: Runtime and MessageRouter use the same canonical EventBus instance (no duplicates)', () => {
    assert.strictEqual(
      globalKairoEventBus,
      eventBusInstance,
      'globalKairoEventBus and eventBusInstance MUST reference the exact same canonical EventBus instance'
    );
  });

  it('TEST 2, TEST 3 & TEST 4: Emitted runtime event reaches MessageRouter and is forwarded to React Webview', async () => {
    const postedMessages: any[] = [];
    const mockWebview: any = {
      postMessage: async (msg: any) => {
        postedMessages.push(msg);
        return true;
      }
    };

    const router = new MessageRouter(mockWebview);

    const testEvent = {
      eventId: 'evt-test-101',
      eventType: 'PromptReceived',
      timestamp: Date.now(),
      source: 'AIKernel',
      priority: 'CRITICAL' as const,
      correlationId: 'session-eb-001',
      sessionId: 'session-eb-001',
      payload: { rawPrompt: 'Create a commercial kitchen website.' }
    };

    await globalKairoEventBus.publish(testEvent);

    assert.ok(postedMessages.length > 0, 'MessageRouter must post a message to Webview on EventBus publish');
    const updateMsg = postedMessages.find(m => m.type === MessageType.EVENT_BUS_UPDATE);
    assert.ok(updateMsg, 'MessageRouter must send EVENT_BUS_UPDATE message type');
    assert.strictEqual(updateMsg.payload.event.payload.eventId, 'evt-test-101');
  });

  it('TEST 6: Event ordering is strictly preserved', async () => {
    const eventSequence: string[] = [];

    eventEvents.subscribe((event: any) => {
      const payload = event?.payload || event;
      if (payload?.eventType) {
        eventSequence.push(payload.eventType);
      }
    });

    const events = [
      'PromptReceived',
      'IntentDetected',
      'PlanningStarted',
      'PlanningCompleted',
      'ExecutionStarted',
      'GenerationStarted',
      'ExecutionCompleted'
    ];

    for (let i = 0; i < events.length; i++) {
      await globalKairoEventBus.publish({
        eventId: `evt-seq-${i}`,
        eventType: events[i],
        timestamp: Date.now(),
        source: 'TestSequence',
        priority: 'HIGH',
        correlationId: 'session-seq-1',
        sessionId: 'session-seq-1',
        payload: { index: i }
      });
    }

    assert.deepStrictEqual(eventSequence, events, 'Events must be received in exact published order');
  });

  it('TEST 7: ExecutionCompleted reaches the UI via MessageRouter', async () => {
    const postedMessages: any[] = [];
    const mockWebview: any = {
      postMessage: async (msg: any) => {
        postedMessages.push(msg);
        return true;
      }
    };

    const router = new MessageRouter(mockWebview);

    await globalKairoEventBus.publish({
      eventId: 'evt-exec-done-999',
      eventType: 'ExecutionCompleted',
      timestamp: Date.now(),
      source: 'ExecutionEngine',
      priority: 'CRITICAL',
      correlationId: 'session-exec-1',
      sessionId: 'session-exec-1',
      payload: { success: true, contractsCount: 5 }
    });

    const execMsg = postedMessages.find(m => 
      m.type === MessageType.EVENT_BUS_UPDATE &&
      m.payload.event.payload.eventType === 'ExecutionCompleted'
    );
    assert.ok(execMsg, 'ExecutionCompleted event must reach UI via Webview postMessage');
  });

  it('TEST 8: ExecutionFailed reaches the UI via MessageRouter', async () => {
    const postedMessages: any[] = [];
    const mockWebview: any = {
      postMessage: async (msg: any) => {
        postedMessages.push(msg);
        return true;
      }
    };

    const router = new MessageRouter(mockWebview);

    await globalKairoEventBus.publish({
      eventId: 'evt-exec-fail-999',
      eventType: 'ExecutionFailed',
      timestamp: Date.now(),
      source: 'ExecutionEngine',
      priority: 'CRITICAL',
      correlationId: 'session-fail-1',
      sessionId: 'session-fail-1',
      payload: { error: 'Disk write timeout' }
    });

    const failMsg = postedMessages.find(m => 
      m.type === MessageType.EVENT_BUS_UPDATE &&
      m.payload.event.payload.eventType === 'ExecutionFailed'
    );
    assert.ok(failMsg, 'ExecutionFailed event must reach UI via Webview postMessage');
  });

});
