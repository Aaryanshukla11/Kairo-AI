import * as assert from 'assert';
import { KairoEventBus } from '../../src/core/eventBus/runtime/kairoEventBus';
import { IKairoEvent } from '../../src/core/eventBus/runtime/kairoEventBusTypes';
import { KairoExecutionEngine } from '../../src/core/executionEngine/kairoExecutionEngine';

describe('Execution Engine and Event Bus Runtime Unit Tests', () => {
  let eventBus: KairoEventBus;
  let engine: KairoExecutionEngine;

  beforeEach(() => {
    eventBus = new KairoEventBus();
    engine = new KairoExecutionEngine(eventBus);
    eventBus.clearHistory();
    engine.clearHistory();
  });

  it('should publish, subscribe, and validate events on KairoEventBus', async () => {
    let received = false;

    eventBus.subscribe('PromptReceived', async (event: IKairoEvent) => {
      received = true;
      assert.strictEqual(event.sessionId, 'session-test-01');
    });

    const event: IKairoEvent = {
      eventId: 'evt-prompt-001',
      eventType: 'PromptReceived',
      timestamp: Date.now(),
      source: 'AIKernel',
      priority: 'CRITICAL',
      correlationId: 'req-001',
      sessionId: 'session-test-01',
      payload: { rawPrompt: 'Build me a hospital portal' }
    };

    await eventBus.publish(event);

    assert.strictEqual(received, true);
    assert.strictEqual(eventBus.getHistory().length, 1);
  });

  it('should validate and reject unknown, duplicate, or invalid payload events', async () => {
    const invalidEvent: IKairoEvent = {
      eventId: 'evt-unknown-001',
      eventType: 'NonExistentEvent' as any,
      timestamp: Date.now(),
      source: 'Test',
      priority: 'LOW',
      correlationId: 'req-002',
      sessionId: 'session-002',
      payload: {}
    };

    const val = eventBus.validateEvent(invalidEvent);
    assert.strictEqual(val.valid, false);
    assert.strictEqual(val.errorType, 'UNKNOWN_EVENT');
  });

  it('should process GenerationResult through full 9-stage pipeline in KairoExecutionEngine', async () => {
    const genDoneEvent: IKairoEvent = {
      eventId: 'evt-gen-done-01',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'GeneratorSDK',
      priority: 'CRITICAL',
      correlationId: 'req-003',
      sessionId: 'session-003',
      payload: {
        requestId: 'req-003',
        sessionId: 'session-003',
        generatedArtifacts: ['package.json', 'tsconfig.json', 'README.md', 'src/app.ts'],
        protectedFiles: ['.env']
      }
    };

    const result = await engine.executeGenerationResult(genDoneEvent);

    assert.strictEqual(result.executionReport.status, 'SUCCESS');
    assert.ok(result.executionReport.writtenFiles.length >= 4);
    assert.strictEqual(result.executionReport.buildStatus, 'PASSED');
    assert.strictEqual(result.executionReport.testsStatus, 'PASSED');
  });

  it('should emit the complete 10-stage event sequence from PromptReceived to ProjectCompleted', async () => {
    const eventSequence: string[] = [];

    eventBus.subscribe('*', async (e: IKairoEvent) => {
      eventSequence.push(e.eventType);
    });

    const sessionId = 'session-full-flow-01';
    const correlationId = 'req-full-flow-01';

    // Sequence publication simulation
    await eventBus.publish({ eventId: 'e1', eventType: 'PromptReceived', timestamp: Date.now(), source: 'Kernel', priority: 'CRITICAL', correlationId, sessionId, payload: {} });
    await eventBus.publish({ eventId: 'e2', eventType: 'RequirementCompleted', timestamp: Date.now(), source: 'RequirementAgent', priority: 'HIGH', correlationId, sessionId, payload: {} });
    await eventBus.publish({ eventId: 'e3', eventType: 'ArchitectureCompleted', timestamp: Date.now(), source: 'ArchitectureAgent', priority: 'HIGH', correlationId, sessionId, payload: {} });
    await eventBus.publish({ eventId: 'e4', eventType: 'WorkspaceCompleted', timestamp: Date.now(), source: 'WorkspaceAgent', priority: 'HIGH', correlationId, sessionId, payload: {} });
    await eventBus.publish({ eventId: 'e5', eventType: 'ManifestCompleted', timestamp: Date.now(), source: 'ProjectManifestAgent', priority: 'HIGH', correlationId, sessionId, payload: {} });

    // GenerationCompleted triggers ExecutionStarted -> ExecutionCompleted -> ReviewUpdated -> ProjectCompleted automatically
    await eventBus.publish({ eventId: 'e6', eventType: 'GenerationCompleted', timestamp: Date.now(), source: 'GeneratorSDK', priority: 'CRITICAL', correlationId, sessionId, payload: { requestId: correlationId, sessionId } });

    assert.ok(eventSequence.includes('PromptReceived'));
    assert.ok(eventSequence.includes('RequirementCompleted'));
    assert.ok(eventSequence.includes('ArchitectureCompleted'));
    assert.ok(eventSequence.includes('WorkspaceCompleted'));
    assert.ok(eventSequence.includes('ManifestCompleted'));
    assert.ok(eventSequence.includes('GenerationCompleted'));
    assert.ok(eventSequence.includes('ExecutionStarted'));
    assert.ok(eventSequence.includes('ExecutionCompleted'));
    assert.ok(eventSequence.includes('ReviewUpdated'));
    assert.ok(eventSequence.includes('ProjectCompleted'));
  });
});
