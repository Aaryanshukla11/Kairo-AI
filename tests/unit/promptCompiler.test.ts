import * as assert from 'assert';
import { promptCompiler } from '../../src/core/promptCompiler/promptCompiler';
import { promptSanitizer } from '../../src/core/promptCompiler/promptSanitizer';
import { promptOptimizer } from '../../src/core/promptCompiler/promptOptimizer';
import { promptCompressor } from '../../src/core/promptCompiler/promptCompressor';
import { PromptType } from '../../src/core/promptCompiler/promptTypes';

describe('Prompt Compiler Tests', () => {
  describe('Sanitizer Rules', () => {
    it('should scrub credentials and secrets from prompts', () => {
      const text = 'Connection string: password=super-secret-key-123 API Key: sk_live_51MszF9e2uJ8t';
      const sanitized = promptSanitizer.sanitize(text);
      assert.ok(sanitized.includes('[SCRUBBED]'));
      assert.ok(sanitized.includes('[API KEY SCRUBBED]'));
    });
  });

  describe('Optimization', () => {
    it('should collapse sequential whitespaces and blank lines', () => {
      const prompt = `
        You are a coder.
        
        
        Write binary search.
      `;
      const { optimized } = promptOptimizer.optimize(prompt);
      assert.ok(optimized.includes('coder.\n\nWrite'));
    });

    it('should drop duplicated context headers', () => {
      const prompt = `
        === SOURCE: WORKSPACE [ID: 1] ===
        Content 1
        === SOURCE: WORKSPACE [ID: 1] ===
        Content 1 duplicated
      `;
      const { optimized, report } = promptOptimizer.optimize(prompt);
      assert.strictEqual(report.removedDuplicates, 1);
    });
  });

  describe('Compiler Pipeline', () => {
    it('should load template and compile final prompt', async () => {
      const req = {
        type: PromptType.Coding,
        userPrompt: 'Write binary search',
        workspaceRules: ['Use TypeScript', 'No global variables']
      };

      const result = await promptCompiler.compile(req);
      assert.ok(result.compiledPrompt.includes('Workspace Conventions Rules:'));
      assert.ok(result.compiledPrompt.includes('1. Use TypeScript'));
      assert.ok(result.compiledPrompt.includes('User Request:\nWrite binary search'));
      assert.strictEqual(result.report.templateName, 'Coding Template');
    });
  });
});
