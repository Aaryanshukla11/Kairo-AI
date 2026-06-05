import * as assert from 'assert';
import { eventBusInstance } from '../../src/core/eventBus/eventBus';
import { eventRegistry } from '../../src/core/eventBus/eventRegistry';
import { eventPublisher } from '../../src/core/eventBus/eventPublisher';
import { eventSubscriber } from '../../src/core/eventBus/eventSubscriber';
import { workflowStateTracker } from '../../src/core/eventBus/workflowState';
import { workflowOrchestrator } from '../../src/core/eventBus/workflowOrchestrator';
import { deadLetterQueue } from '../../src/core/eventBus/deadLetterQueue';
import { eventPersistence } from '../../src/core/eventBus/eventPersistence';
import { eventReplay } from '../../src/core/eventBus/eventReplay';
import { eventMetrics } from '../../src/core/eventBus/eventMetrics';

describe('Event Bus & Workflow Orchestration (M03-S03-T011) Tests', () => {
  beforeEach(() => {
    deadLetterQueue.clear();
    eventPersistence.clear();
  });

  it('should publish and subscribe to category events successfully', async () => {
    let triggered = false;
    eventSubscriber.subscribe('Validation', async (ev) => {
      triggered = true;
      assert.strictEqual(ev.payload.data, 'test_val');
    });

    await eventPublisher.publish({
      workflowId: 'wf-test-1',
      correlationId: 'corr-1',
      publisher: 'TestRunner',
      subscribers: ['sub-1'],
      priority: 'Normal',
      category: 'Validation',
      payload: { data: 'test_val' },
      metadata: {}
    });

    assert.strictEqual(triggered, true);
    assert.strictEqual(eventPersistence.getHistory('wf-test-1').length, 1);
  });

  it('should handle routing events to dead letter queue on subscriber failure', async () => {
    eventSubscriber.subscribe('Security', async () => {
      throw new Error('Subscriber execution failed');
    });

    await eventPublisher.publish({
      workflowId: 'wf-test-2',
      correlationId: 'corr-2',
      publisher: 'TestRunner',
      subscribers: ['sub-2'],
      priority: 'High',
      category: 'Security',
      payload: { secret: 'unprotected' },
      metadata: {}
    });

    const dls = deadLetterQueue.list();
    assert.ok(dls.length >= 1);
    assert.strictEqual(dls[0].failureReason, 'Subscriber execution failed');
  });

  it('should start workflow and transition states', async () => {
    await workflowOrchestrator.startWorkflow('wf-seq-123', { task: 'sequential validation' });
    const state = workflowStateTracker.get('wf-seq-123');
    assert.strictEqual(state, 'Running');
  });

  it('should record throughput and latency metrics', () => {
    eventMetrics.record(12);
    eventMetrics.record(18);
    assert.strictEqual(eventMetrics.getThroughput(), 2);
    assert.strictEqual(eventMetrics.getAverageLatency(), 15);
  });

  it('should replay historical logs', async () => {
    await eventPublisher.publish({
      workflowId: 'wf-replay-test',
      correlationId: 'corr-3',
      publisher: 'TestRunner',
      subscribers: [],
      priority: 'Normal',
      category: 'Telemetry',
      payload: { metric: 'heap_size' },
      metadata: {}
    });

    const replayed = await eventReplay.replay('wf-replay-test');
    assert.strictEqual(replayed, 1);
  });
});
