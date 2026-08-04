import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { EmbeddingEngine } from '../../src/core/embedding/embeddingEngine';
import { EmbeddingSourceType, EmbeddingStatus } from '../../src/core/embedding/embeddingTypes';
import { EmbeddingProvider } from '../../src/core/embedding/providers/baseProvider';

describe('Embedding Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-embedding-workspace');
  let engine: EmbeddingEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new EmbeddingEngine();
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Embedding Lifecycle', () => {
    it('should queue, cache, mock generate, and validate embeddings targets', async () => {
      const sourceId = 'src/service.ts';
      const sourceType = EmbeddingSourceType.File;
      const content = 'export class DatabaseService {}';

      const initial = engine.queueJob(sourceId, sourceType, content);
      assert.strictEqual(initial.status, EmbeddingStatus.Queued);
      assert.strictEqual(engine.getPendingQueue().length, 1);

      const dup = engine.queueJob(sourceId, sourceType, content);
      assert.strictEqual(dup.status, EmbeddingStatus.Queued);
      assert.strictEqual(engine.getPendingQueue().length, 1);

      await engine.processQueue();
      assert.strictEqual(engine.getPendingQueue().length, 0);

      const cached = engine.queueJob(sourceId, sourceType, content);
      assert.strictEqual(cached.status, EmbeddingStatus.Completed);
      assert.strictEqual(engine.getPendingQueue().length, 0);

      assert.throws(() => {
        engine.queueJob('', sourceType, content);
      }, /Source ID is required/);

      assert.throws(() => {
        engine.queueJob(sourceId, sourceType, '');
      }, /Embedding content cannot be empty/);
    });

    it('should support provider replacements', async () => {
      const customProvider: EmbeddingProvider = {
        name: 'CustomOfflineProvider',
        dimensions: 4,
        generate: async (c) => [0.1, 0.2, 0.3, 0.4]
      };

      engine.setProvider(customProvider);
      assert.strictEqual(engine.getProviderName(), 'CustomOfflineProvider');

      const sourceId = 'src/app.ts';
      engine.queueJob(sourceId, EmbeddingSourceType.File, 'console.log("Custom provider");');
      await engine.processQueue();

      const cached = engine.queueJob(sourceId, EmbeddingSourceType.File, 'console.log("Custom provider");');
      assert.strictEqual(cached.provider, 'CustomOfflineProvider');
      assert.deepStrictEqual(cached.vector, [0.1, 0.2, 0.3, 0.4]);
    });
  });
});
