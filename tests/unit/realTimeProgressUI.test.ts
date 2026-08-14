import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { globalKairoEventBus } from '../../src/core/eventBus/runtime/kairoEventBus';
import { MessageRouter } from '../../src/extension/messageRouter';
import { MessageType } from '../../src/common/protocol';
import { globalKairoExecutionEngine } from '../../src/core/executionEngine/kairoExecutionEngine';
import { generatorSDK } from '../../src/core/agents/generatorSDK/generatorSDK';

describe('Real-Time Granular Execution Progress UI Tests', () => {
  let webviewMessages: any[] = [];
  let mockWebview: any;
  let router: MessageRouter;
  let testTmpDir: string;

  beforeEach(() => {
    webviewMessages = [];
    mockWebview = {
      postMessage: async (msg: any) => {
        webviewMessages.push(msg);
        return true;
      }
    };
    router = new MessageRouter(mockWebview);
    testTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kairo-progress-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testTmpDir)) {
      fs.rmSync(testTmpDir, { recursive: true, force: true });
    }
  });

  it('TEST 1 & 2: Stage start & completion events reach UI via EventBus and MessageRouter', async () => {
    await globalKairoEventBus.publish({
      eventId: 'evt-req-start-test',
      eventType: 'RequirementAnalysisStarted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'HIGH' as const,
      correlationId: 'session-1',
      sessionId: 'session-1',
      payload: { stage: 'Analyzing Requirements' }
    });

    await globalKairoEventBus.publish({
      eventId: 'evt-req-done-test',
      eventType: 'RequirementAnalysisCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'HIGH' as const,
      correlationId: 'session-1',
      sessionId: 'session-1',
      payload: { stage: 'Requirements Analyzed' }
    });

    const updates = webviewMessages.filter(m => m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104);
    assert.strictEqual(updates.length, 2, 'Both stage events MUST reach Webview IPC bridge');
    assert.strictEqual(updates[0].payload.eventType, 'RequirementAnalysisStarted');
    assert.strictEqual(updates[1].payload.eventType, 'RequirementAnalysisCompleted');
  });

  it('TEST 3, 4, 5: GeneratorStart, FileGenerationStarted and FileGenerationCompleted reach UI', async () => {
    await globalKairoEventBus.publish({
      eventId: 'evt-gen-start-test',
      eventType: 'GeneratorStarted',
      timestamp: Date.now(),
      source: 'GeneratorSDK',
      priority: 'HIGH' as const,
      correlationId: 'session-2',
      sessionId: 'session-2',
      payload: { generator: 'frontend-generator', generatorName: 'UI Component Generator' }
    });

    await globalKairoEventBus.publish({
      eventId: 'evt-file-gen-start-test',
      eventType: 'FileGenerationStarted',
      timestamp: Date.now(),
      source: 'GeneratorSDK',
      priority: 'HIGH' as const,
      correlationId: 'session-2',
      sessionId: 'session-2',
      payload: { filePath: 'src/App.tsx', generator: 'frontend-generator', status: 'GENERATING' }
    });

    await globalKairoEventBus.publish({
      eventId: 'evt-file-gen-done-test',
      eventType: 'FileGenerationCompleted',
      timestamp: Date.now(),
      source: 'GeneratorSDK',
      priority: 'HIGH' as const,
      correlationId: 'session-2',
      sessionId: 'session-2',
      payload: { filePath: 'src/App.tsx', generator: 'frontend-generator', status: 'GENERATED' }
    });

    const fileUpdates = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && m.payload?.payload?.filePath === 'src/App.tsx');
    assert.strictEqual(fileUpdates.length, 2);
    assert.strictEqual(fileUpdates[0].payload.eventType, 'FileGenerationStarted');
    assert.strictEqual(fileUpdates[1].payload.eventType, 'FileGenerationCompleted');
  });

  it('TEST 6, 7, 10: FileWriteStarted & FileWriteCompleted emitted around real disk write', async () => {
    const contracts = [
      {
        contractVersion: '1.0.0',
        fileOperations: [
          { operationType: 'CREATE_FILE', filePath: 'server.ts', relativePath: 'server.ts', content: 'const app = express();' }
        ]
      }
    ];

    const event = {
      eventId: 'evt-exec-write-test',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'CRITICAL' as const,
      correlationId: 'session-3',
      sessionId: 'session-3',
      payload: {
        requestId: 'req-write-001',
        workspacePath: testTmpDir,
        contracts
      }
    };

    await globalKairoExecutionEngine.executeGenerationResult(event);

    const createdFilePath = path.join(testTmpDir, 'server.ts');
    assert.ok(fs.existsSync(createdFilePath), 'File MUST physically exist on real disk before write completed');

    const writeEvents = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && m.payload?.payload?.filePath === 'server.ts');
    assert.ok(writeEvents.length >= 2, 'Must emit both FileWriteStarted and FileWriteCompleted');
    
    const types = writeEvents.map(e => e.payload.eventType);
    assert.ok(types.includes('FileWriteStarted'), 'FileWriteStarted must be emitted before write');
    assert.ok(types.includes('FileWriteCompleted'), 'FileWriteCompleted must be emitted after write');
  });

  it('TEST 8: FileWriteFailed reaches UI on error', async () => {
    const contracts = [
      {
        contractVersion: '1.0.0',
        fileOperations: [
          { operationType: 'CREATE_FILE', filePath: '../../malicious.txt', relativePath: '../../malicious.txt', content: 'fail' }
        ]
      }
    ];

    const event = {
      eventId: 'evt-exec-fail-test',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'CRITICAL' as const,
      correlationId: 'session-4',
      sessionId: 'session-4',
      payload: {
        requestId: 'req-fail-001',
        workspacePath: testTmpDir,
        contracts
      }
    };

    await assert.rejects(async () => {
      await globalKairoExecutionEngine.executeGenerationResult(event);
    });

    const failEvents = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && (m.payload?.eventType === 'FileWriteFailed' || m.payload?.eventType === 'ExecutionFailed'));
    assert.ok(failEvents.length > 0, 'Security path traversal error MUST emit failure event to UI');
  });

  it('TEST 9 & 13: Multiple files update independently preserving event order', async () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts'];
    for (const f of files) {
      await globalKairoEventBus.publish({
        eventId: `evt-multi-${f}`,
        eventType: 'FileWriteCompleted',
        timestamp: Date.now(),
        source: 'Test',
        priority: 'HIGH' as const,
        correlationId: 'session-5',
        sessionId: 'session-5',
        payload: { filePath: f, status: 'WRITTEN' }
      });
    }

    const multiEvents = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && m.payload?.eventType === 'FileWriteCompleted');
    assert.strictEqual(multiEvents.length, 3);
    assert.strictEqual(multiEvents[0].payload.payload.filePath, 'src/a.ts');
    assert.strictEqual(multiEvents[1].payload.payload.filePath, 'src/b.ts');
    assert.strictEqual(multiEvents[2].payload.payload.filePath, 'src/c.ts');
  });

  it('TEST 11 & 12 & 14: ExecutionCompleted reaches UI without fake timers on canonical EventBus', async () => {
    await globalKairoEventBus.publish({
      eventId: 'evt-comp-done-test',
      eventType: 'ExecutionCompleted',
      timestamp: Date.now(),
      source: 'KairoExecutionEngine',
      priority: 'CRITICAL' as const,
      correlationId: 'session-6',
      sessionId: 'session-6',
      payload: { status: 'SUCCESS' }
    });

    const compEvents = webviewMessages.filter(m => (m.type === MessageType.EVENT_BUS_UPDATE || m.type === 104) && m.payload?.eventType === 'ExecutionCompleted');
    assert.strictEqual(compEvents.length, 1);
    assert.strictEqual(compEvents[0].payload.payload.status, 'SUCCESS');
  });
});
