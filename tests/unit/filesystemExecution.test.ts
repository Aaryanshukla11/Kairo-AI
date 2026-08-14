import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { globalKairoExecutionEngine } from '../../src/core/executionEngine/kairoExecutionEngine';
import { reviewEvents } from '../../src/core/review/reviewEvents';

describe('Blocker #5 - Real Filesystem Execution & Disk Persistence Tests', () => {
  let testTmpDir: string;

  beforeEach(() => {
    testTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kairo-fs-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testTmpDir)) {
      fs.rmSync(testTmpDir, { recursive: true, force: true });
    }
  });

  it('TEST 1: Valid workspace -> file successfully created and verified on disk', async () => {
    const contracts = [
      {
        contractVersion: '1.0.0',
        fileOperations: [
          { operationType: 'CREATE_FILE', filePath: 'index.html', relativePath: 'index.html', content: '<h1>Test Site</h1>' }
        ]
      }
    ];

    const event = {
      eventId: 'evt-fs-001',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'CRITICAL' as const,
      correlationId: 'session-fs-1',
      sessionId: 'session-fs-1',
      payload: {
        requestId: 'req-fs-001',
        workspacePath: testTmpDir,
        contracts
      }
    };

    const res = await globalKairoExecutionEngine.executeGenerationResult(event);
    assert.strictEqual(res.executionReport.status, 'SUCCESS');

    const createdFilePath = path.join(testTmpDir, 'index.html');
    assert.ok(fs.existsSync(createdFilePath), 'File MUST exist physically on disk');
    assert.strictEqual(fs.readFileSync(createdFilePath, 'utf-8'), '<h1>Test Site</h1>');
  });

  it('TEST 2: Nested directory -> parent directories created automatically and files written', async () => {
    const contracts = [
      {
        contractVersion: '1.0.0',
        fileOperations: [
          { operationType: 'CREATE_FILE', filePath: 'src/components/Header.tsx', relativePath: 'src/components/Header.tsx', content: 'export const Header = () => null;' }
        ]
      }
    ];

    const event = {
      eventId: 'evt-fs-002',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'CRITICAL' as const,
      correlationId: 'session-fs-2',
      sessionId: 'session-fs-2',
      payload: {
        requestId: 'req-fs-002',
        workspacePath: testTmpDir,
        contracts
      }
    };

    const res = await globalKairoExecutionEngine.executeGenerationResult(event);
    assert.strictEqual(res.executionReport.status, 'SUCCESS');

    const nestedFilePath = path.join(testTmpDir, 'src', 'components', 'Header.tsx');
    assert.ok(fs.existsSync(nestedFilePath), 'Nested file MUST exist physically on disk');
    assert.strictEqual(fs.readFileSync(nestedFilePath, 'utf-8'), 'export const Header = () => null;');
  });

  it('TEST 3 & TEST 7: Invalid workspace / empty path -> execution fails clearly without fallback to process.cwd()', async () => {
    const event = {
      eventId: 'evt-fs-003',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'CRITICAL' as const,
      correlationId: 'session-fs-3',
      sessionId: 'session-fs-3',
      payload: {
        requestId: 'req-fs-003',
        workspacePath: '', // Invalid empty workspace
        contracts: []
      }
    };

    await assert.rejects(async () => {
      await globalKairoExecutionEngine.executeGenerationResult(event);
    }, /No active workspace directory provided/);
  });

  it('TEST 4: Path traversal attempt (../../outside-project) -> operation rejected with security violation', async () => {
    const contracts = [
      {
        contractVersion: '1.0.0',
        fileOperations: [
          { operationType: 'CREATE_FILE', filePath: '../../malicious.txt', relativePath: '../../malicious.txt', content: 'malicious' }
        ]
      }
    ];

    const event = {
      eventId: 'evt-fs-004',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'CRITICAL' as const,
      correlationId: 'session-fs-4',
      sessionId: 'session-fs-4',
      payload: {
        requestId: 'req-fs-004',
        workspacePath: testTmpDir,
        contracts
      }
    };

    await assert.rejects(async () => {
      await globalKairoExecutionEngine.executeGenerationResult(event);
    }, /escapes target workspace/);
  });

  it('TEST 5: Filesystem write failure -> execution reports failure', async () => {
    // Pass read-only directory or invalid target
    const invalidPath = path.join(testTmpDir, 'non-existent-file-as-dir');
    fs.writeFileSync(invalidPath, 'im a file not a dir');

    const contracts = [
      {
        contractVersion: '1.0.0',
        fileOperations: [
          { operationType: 'CREATE_FILE', filePath: 'non-existent-file-as-dir/child.txt', relativePath: 'non-existent-file-as-dir/child.txt', content: 'test' }
        ]
      }
    ];

    const event = {
      eventId: 'evt-fs-005',
      eventType: 'GenerationCompleted',
      timestamp: Date.now(),
      source: 'Test',
      priority: 'CRITICAL' as const,
      correlationId: 'session-fs-5',
      sessionId: 'session-fs-5',
      payload: {
        requestId: 'req-fs-005',
        workspacePath: testTmpDir,
        contracts
      }
    };

    await assert.rejects(async () => {
      await globalKairoExecutionEngine.executeGenerationResult(event);
    });
  });

  it('TEST 6: Successful write -> Review Changes receives real operation', async () => {
    let reviewReceived = false;

    const unsub = reviewEvents.subscribe((evt: any) => {
      if (evt.type === 'ReviewCompleted') {
        reviewReceived = true;
      }
    });

    try {
      const contracts = [
        {
          contractVersion: '1.0.0',
          fileOperations: [
            { operationType: 'CREATE_FILE', filePath: 'test.ts', relativePath: 'test.ts', content: 'const x = 1;' }
          ]
        }
      ];

      const event = {
        eventId: 'evt-fs-006',
        eventType: 'GenerationCompleted',
        timestamp: Date.now(),
        source: 'Test',
        priority: 'CRITICAL' as const,
        correlationId: 'session-fs-6',
        sessionId: 'session-fs-6',
        payload: {
          requestId: 'req-fs-006',
          workspacePath: testTmpDir,
          contracts
        }
      };

      await globalKairoExecutionEngine.executeGenerationResult(event);
      assert.strictEqual(reviewReceived, true, 'Review Engine MUST receive write notification');
    } finally {
      unsub();
    }
  });

});
