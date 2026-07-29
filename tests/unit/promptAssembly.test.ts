import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { PromptAssemblyEngine } from '../../src/core/promptAssembly/promptAssemblyEngine';
import { PromptType } from '../../src/core/promptAssembly/promptTypes';

describe('Prompt Assembly Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-prompt-workspace');
  let engine: PromptAssemblyEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new PromptAssemblyEngine();
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Prompt Compilation Lifecycle', () => {
    it('should assemble prompts and run compression and token estimators', () => {
      const pkg = engine.assemblePrompt({
        prompt: 'Build indexer validation engine.',
        type: PromptType.CodeGen,
        workspaceSummary: 'Extension code structure',
        gitSummary: 'Clean git commits log',
        diagnostics: ['Warning: Missing files'],
        retrievedContext: {
          files: [
            { filePath: 'src/app.ts', language: 'TypeScript', size: 100 },
            { filePath: 'src/app.ts', language: 'TypeScript', size: 100 }
          ],
          symbols: [
            { name: 'validate', type: 'Function' as any, filePath: 'src/app.ts', line: 1 },
            { name: 'validate', type: 'Function' as any, filePath: 'src/app.ts', line: 1 }
          ],
          dependencies: [],
          configs: [],
          documentation: [],
          confidenceScore: 0.9
        }
      });

      assert.ok(pkg.systemPrompt.includes('generate correct'));
      assert.strictEqual(pkg.metadata.sourcesCount, 2);
      assert.ok(pkg.estimatedTokens > 0);

      const pkgSecond = engine.assemblePrompt({
        prompt: 'Build indexer validation engine.',
        type: PromptType.CodeGen,
        workspaceSummary: 'Extension code structure',
        gitSummary: 'Clean git commits log',
        diagnostics: ['Warning: Missing files'],
        retrievedContext: {
          files: [
            { filePath: 'src/app.ts', language: 'TypeScript', size: 100 },
            { filePath: 'src/app.ts', language: 'TypeScript', size: 100 }
          ],
          symbols: [
            { name: 'validate', type: 'Function' as any, filePath: 'src/app.ts', line: 1 },
            { name: 'validate', type: 'Function' as any, filePath: 'src/app.ts', line: 1 }
          ],
          dependencies: [],
          configs: [],
          documentation: [],
          confidenceScore: 0.9
        }
      });
      assert.deepStrictEqual(pkg, pkgSecond);
    });

    it('should throw validator exception on oversized prompts', () => {
      assert.throws(() => {
        engine.assemblePrompt({
          prompt: 'Oversized test prompt',
          type: PromptType.CodeGen,
          tokenLimit: 5
        });
      }, /Oversized prompt/);
    });

    it('should throw validation error on empty requests', () => {
      assert.throws(() => {
        engine.assemblePrompt({ prompt: '', type: PromptType.CodeGen });
      }, /Request prompt is required/);
    });
  });
});
