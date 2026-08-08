import * as assert from 'assert';
import { codingRuntime } from '../../src/core/coding-runtime';
import { IGeneratorSession } from '../../src/core/generator-session-builder/types';
import { ICodingModelProvider } from '../../src/core/coding-runtime/types';

describe('Sprint 3 - Coding Runtime Module Tests', () => {

  const mockSession: IGeneratorSession = {
    sessionId: 'session-gen-001',
    timestamp: Date.now(),
    systemRole: 'Senior Engineer',
    generationRules: [],
    architectureRules: [],
    codingStandards: { languageConventions: '', namingConventions: '', formattingRules: '' },
    outputContractSpecification: 'schema contract',
    requestPayload: {
      requestId: 'req-1',
      targetPlatform: 'Web',
      technologyStack: { language: 'TypeScript', frontend: 'React', backend: null, database: null }
    },
    metadata: { estimatedTokenCount: 120, formatType: 'JSON_OUTPUT' }
  };

  const sampleResponseJson = JSON.stringify({
    generatedFiles: [{ path: 'src/index.ts', content: 'console.log("Hello");' }],
    modifiedFiles: [],
    createdDirectories: []
  });

  it('should stream chunks and return SUCCESS on valid compilation', async () => {
    let chunksRec: string[] = [];
    const successProvider: ICodingModelProvider = {
      providerId: 'mock-qwen-coder',
      executeStream: async (session, onChunk) => {
        onChunk('{"generatedFiles"');
        onChunk(': []}');
        return sampleResponseJson;
      }
    };

    const result = await codingRuntime.execute(mockSession, successProvider, { timeoutMs: 5000, maxRetries: 1 }, (c) => {
      chunksRec.push(c);
    });

    assert.strictEqual(result.status, 'SUCCESS');
    assert.strictEqual(result.rawJsonContent, sampleResponseJson);
    assert.strictEqual(chunksRec.length, 2);
    assert.ok(result.metrics.durationMs >= 0);

    // Verify immutability
    assert.throws(() => {
      (result as any).status = 'FAILED';
    }, /Cannot assign to read only property/);
  });

  it('should abort execution and return CANCELLED when abort signal is triggered', async () => {
    const controller = new AbortController();
    const abortProvider: ICodingModelProvider = {
      providerId: 'mock-canceller-coder',
      executeStream: async (session, onChunk, signal) => {
        if (signal?.aborted) {
          throw new Error('Aborted');
        }
        controller.abort(); // Trigger abort mid-stream
        throw new Error('Aborted');
      }
    };

    const result = await codingRuntime.execute(mockSession, abortProvider, { timeoutMs: 5000, maxRetries: 1 }, undefined, controller.signal);
    assert.strictEqual(result.status, 'CANCELLED');
  });

  it('should recover execution when provider fails intermittently and succeeds in retries', async () => {
    let attemptsCount = 0;
    const flakeyProvider: ICodingModelProvider = {
      providerId: 'mock-flakey-coder',
      executeStream: async () => {
        attemptsCount++;
        if (attemptsCount < 3) {
          throw new Error('Connection refused');
        }
        return sampleResponseJson;
      }
    };

    const result = await codingRuntime.execute(mockSession, flakeyProvider, { timeoutMs: 5000, maxRetries: 3 });
    assert.strictEqual(result.status, 'SUCCESS');
    assert.strictEqual(attemptsCount, 3);
  });

});
