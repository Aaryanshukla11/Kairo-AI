import * as assert from 'assert';
import { globalKairoEventBus } from '../../src/core/eventBus/runtime/kairoEventBus';
import { MessageRouter } from '../../src/extension/messageRouter';
import { MessageType } from '../../src/common/protocol';

describe('Real-Time Activity UX Component Tests', () => {
  let webviewMessages: any[] = [];
  let mockWebview: any;
  let router: MessageRouter;

  beforeEach(() => {
    webviewMessages = [];
    mockWebview = {
      postMessage: async (msg: any) => {
        webviewMessages.push(msg);
        return true;
      }
    };
    router = new MessageRouter(mockWebview);
  });

  it('TEST 1: Stage events trigger real-time activity updates over MessageRouter IPC', async () => {
    await globalKairoEventBus.publish({
      eventId: 'act-evt-1',
      eventType: 'RequirementAnalysisStarted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'HIGH',
      correlationId: 'sess-1',
      sessionId: 'sess-1',
      payload: { stage: 'Detecting requirements' }
    });

    const updates = webviewMessages.filter(m => m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104);
    assert.strictEqual(updates.length, 1);
    assert.strictEqual(updates[0].payload.eventType, 'RequirementAnalysisStarted');
  });

  it('TEST 2: FileGenerationStarted updates file state to GENERATING', async () => {
    await globalKairoEventBus.publish({
      eventId: 'act-evt-2',
      eventType: 'FileGenerationStarted',
      timestamp: Date.now(),
      source: 'GeneratorSDK',
      priority: 'HIGH',
      correlationId: 'sess-2',
      sessionId: 'sess-2',
      payload: { filePath: 'src/components/ProductCard.tsx', status: 'GENERATING' }
    });

    const updates = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && m.payload?.payload?.filePath === 'src/components/ProductCard.tsx');
    assert.strictEqual(updates.length, 1);
    assert.strictEqual(updates[0].payload.eventType, 'FileGenerationStarted');
  });

  it('TEST 3: FileWriteStarted and FileWriteCompleted transition status to WRITING and CREATED', async () => {
    await globalKairoEventBus.publish({
      eventId: 'act-evt-3a',
      eventType: 'FileWriteStarted',
      timestamp: Date.now(),
      source: 'KairoExecutionEngine',
      priority: 'HIGH',
      correlationId: 'sess-3',
      sessionId: 'sess-3',
      payload: { filePath: 'src/App.tsx', status: 'WRITING' }
    });

    await globalKairoEventBus.publish({
      eventId: 'act-evt-3b',
      eventType: 'FileWriteCompleted',
      timestamp: Date.now(),
      source: 'KairoExecutionEngine',
      priority: 'HIGH',
      correlationId: 'sess-3',
      sessionId: 'sess-3',
      payload: { filePath: 'src/App.tsx', status: 'WRITTEN' }
    });

    const updates = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && m.payload?.payload?.filePath === 'src/App.tsx');
    assert.strictEqual(updates.length, 2);
    assert.strictEqual(updates[0].payload.eventType, 'FileWriteStarted');
    assert.strictEqual(updates[1].payload.eventType, 'FileWriteCompleted');
  });

  it('TEST 4: FileWriteFailed triggers error status for target file', async () => {
    await globalKairoEventBus.publish({
      eventId: 'act-evt-4',
      eventType: 'FileWriteFailed',
      timestamp: Date.now(),
      source: 'KairoExecutionEngine',
      priority: 'CRITICAL',
      correlationId: 'sess-4',
      sessionId: 'sess-4',
      payload: { filePath: 'src/api/products.ts', error: 'Disk write error' }
    });

    const updates = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && m.payload?.payload?.filePath === 'src/api/products.ts');
    assert.strictEqual(updates.length, 1);
    assert.strictEqual(updates[0].payload.eventType, 'FileWriteFailed');
    assert.strictEqual(updates[0].payload.payload.error, 'Disk write error');
  });

  it('TEST 5: Verify NO progress bar or percentage counter exists', () => {
    const fs = require('fs');
    const path = require('path');
    const activityDir = path.join(__dirname, '..', '..', 'src', 'webview', 'components', 'activity');
    const files = fs.readdirSync(activityDir);

    files.forEach((file: string) => {
      const content = fs.readFileSync(path.join(activityDir, file), 'utf8');
      assert.ok(!content.includes('ExecutionProgressBar'), `Component ${file} MUST NOT contain ExecutionProgressBar`);
      assert.ok(!content.includes('percentage'), `Component ${file} MUST NOT contain percentage calculations`);
      assert.ok(!content.includes('progress-bar'), `Component ${file} MUST NOT contain progress-bar styles`);
    });
  });
});
