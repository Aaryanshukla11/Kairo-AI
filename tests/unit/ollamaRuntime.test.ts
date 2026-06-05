import * as assert from 'assert';
import { OllamaRuntime } from '../../src/core/inference/providers/ollamaRuntime';

describe('Sprint 4A - Ollama Runtime Module Tests', () => {
  let originalFetch: typeof fetch;

  before(() => {
    originalFetch = globalThis.fetch;
  });

  after(() => {
    globalThis.fetch = originalFetch;
  });

  it('should run diagnostics on health check and produce structured status', async () => {
    globalThis.fetch = async (url) => {
      if (url.toString().endsWith('/api/version')) {
        return { ok: true, json: async () => ({ version: '0.1.48' }) } as any;
      }
      if (url.toString().endsWith('/api/tags')) {
        return {
          status: 200,
          json: async () => ({
            models: [
              { name: 'qwen2.5-coder:7b' },
              { name: 'nomic-embed-text' }
            ]
          })
        } as any;
      }
      return { ok: false } as any;
    };

    const runtime = new OllamaRuntime();
    const status = await runtime.health();

    assert.strictEqual(status.isRunning, true);
    assert.strictEqual(status.isApiReachable, true);
    assert.strictEqual(status.version, '0.1.48');
    assert.strictEqual(status.installedModels.length, 2);
    assert.ok(status.installedModels.includes('qwen2.5-coder:7b'));
  });

  it('should generate structured installation instructions if V1 models are missing', () => {
    const runtime = new OllamaRuntime();
    const instructions = runtime.getInstallationInstructions(['qwen2.5-coder:7b', 'nomic-embed-text']);

    assert.strictEqual(instructions.missingModels.length, 2);
    assert.ok(instructions.instructions[0].includes('Ensure the Ollama background service'));
    assert.ok(instructions.instructions[1].includes('ollama pull qwen2.5-coder:7b'));
    assert.strictEqual(instructions.rawCommands[0], 'ollama pull qwen2.5-coder:7b');
  });

  it('should generate text using /api/generate endpoint', async () => {
    globalThis.fetch = async (url) => {
      if (url.toString().endsWith('/api/generate')) {
        return {
          ok: true,
          json: async () => ({ response: 'Hello world', eval_count: 2 })
        } as any;
      }
      return { ok: false } as any;
    };

    const runtime = new OllamaRuntime();
    const res = await runtime.generate('Hello');
    assert.strictEqual(res, 'Hello world');
  });

  it('should perform single and batch embedding generation successfully', async () => {
    globalThis.fetch = async (url) => {
      if (url.toString().endsWith('/api/embeddings')) {
        return {
          ok: true,
          json: async () => ({ embedding: [0.1, 0.2, 0.3] })
        } as any;
      }
      return { ok: false } as any;
    };

    const runtime = new OllamaRuntime();
    const emb = await runtime.embed('test content');
    assert.deepStrictEqual(emb, [0.1, 0.2, 0.3]);

    const batch = await runtime.batchEmbed(['text1', 'text2']);
    assert.strictEqual(batch.length, 2);
    assert.deepStrictEqual(batch[0], [0.1, 0.2, 0.3]);
    assert.deepStrictEqual(batch[1], [0.1, 0.2, 0.3]);
  });
});
