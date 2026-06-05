import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { RetrieverEngine } from '../../src/core/retriever/retrieverEngine';
import { RetrievalStrategyType } from '../../src/core/retriever/retrieverTypes';
import { ProjectIndex } from '../../src/core/indexer/indexTypes';

describe('Hybrid Retriever Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-retriever-workspace');
  let engine: RetrieverEngine;
  let mockIndex: ProjectIndex;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new RetrieverEngine();

    mockIndex = {
      id: 'mock-idx',
      workspaceId: 'ws-ret',
      files: [
        { filePath: 'src/app.ts', language: 'TypeScript', size: 100 },
        { filePath: 'src/utils/math.ts', language: 'TypeScript', size: 200 }
      ],
      folders: [],
      symbols: [
        { name: 'calculateSum', type: 'Function' as any, filePath: 'src/utils/math.ts', line: 5 }
      ],
      dependencies: [
        { sourceFilePath: 'src/app.ts', targetFilePath: 'src/utils/math.ts', type: 'Import' }
      ],
      framework: 'React',
      language: 'TypeScript',
      updatedAt: Date.now()
    };
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Retrieval Lifecycle', () => {
    it('should retrieve context using different strategies and use cache', () => {
      const resKeyword = engine.retrieveContext({
        prompt: 'where is math helper?',
        strategy: RetrievalStrategyType.Keyword
      }, mockIndex);

      assert.strictEqual(resKeyword.files.length, 1);
      assert.strictEqual(resKeyword.files[0].filePath, 'src/utils/math.ts');

      const resStructural = engine.retrieveContext({
        prompt: 'import links',
        currentFile: 'src/app.ts',
        strategy: RetrievalStrategyType.Structural
      }, mockIndex);

      assert.strictEqual(resStructural.dependencies.length, 1);
      assert.strictEqual(resStructural.dependencies[0].targetFilePath, 'src/utils/math.ts');

      const resHybrid = engine.retrieveContext({
        prompt: 'math import helpers',
        currentFile: 'src/app.ts',
        strategy: RetrievalStrategyType.Hybrid
      }, mockIndex);

      assert.ok(resHybrid.files.length > 0);
      assert.ok(resHybrid.confidenceScore > 0);

      const firstRun = engine.retrieveContext({ prompt: 'cached prompt' }, mockIndex);
      const secondRun = engine.retrieveContext({ prompt: 'cached prompt' }, mockIndex);
      assert.deepStrictEqual(firstRun, secondRun);

      engine.invalidateCache();
    });

    it('should throw validation error on empty requests', () => {
      assert.throws(() => {
        engine.retrieveContext({ prompt: '' }, mockIndex);
      }, /Request prompt is required/);
    });
  });
});
