import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { VectorStoreEngine } from '../../src/core/vectorStore/vectorStoreEngine';
import { SimilarityMetric } from '../../src/core/vectorStore/vectorStoreTypes';
import { EmbeddingSourceType } from '../../src/core/embedding/embeddingTypes';

describe('Vector Store Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-vector-workspace');
  let engine: VectorStoreEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new VectorStoreEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Vector Lifecycle & Persistence', () => {
    it('should insert, retrieve, search, filter, and load vectors locally', () => {
      const v1 = {
        id: 'vec-1',
        embeddingId: 'emb-1',
        sourceId: 'src/app.ts',
        sourceType: EmbeddingSourceType.File,
        provider: 'MockOfflineProvider',
        dimensions: 3,
        metadata: { category: 'logic' },
        checksum: 'hash-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        vector: [1.0, 0.0, 0.0]
      };

      const v2 = {
        id: 'vec-2',
        embeddingId: 'emb-2',
        sourceId: 'src/util.ts',
        sourceType: EmbeddingSourceType.File,
        provider: 'MockOfflineProvider',
        dimensions: 3,
        metadata: { category: 'helper' },
        checksum: 'hash-2',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        vector: [0.0, 1.0, 0.0]
      };

      engine.insert(v1);
      engine.insert(v2);

      const stats = engine.getStats();
      assert.strictEqual(stats.storedCount, 2);
      assert.strictEqual(stats.dimensions, 3);

      const queried = engine.query({ category: 'helper' });
      assert.strictEqual(queried.length, 1);
      assert.strictEqual(queried[0].id, 'vec-2');

      const search = engine.similaritySearch([1.0, 0.0, 0.0], 2, SimilarityMetric.Cosine);
      assert.strictEqual(search.length, 2);
      assert.strictEqual(search[0].record.id, 'vec-1');
      assert.strictEqual(search[0].score, 1.0);

      const reloadedEngine = new VectorStoreEngine(tempWorkspace);
      const reloadedStats = reloadedEngine.getStats();
      assert.strictEqual(reloadedStats.storedCount, 2);

      const wrongDim = {
        ...v1,
        id: 'vec-3',
        vector: [1.0, 0.0]
      };
      assert.throws(() => {
        engine.insert(wrongDim);
      }, /Dimension mismatch/);

      assert.throws(() => {
        engine.insert(v1);
      }, /Duplicate ID detected/);
    });
  });
});
