import * as assert from 'assert';
import { importValidator } from '../../src/core/codeGeneration/imports/importValidator';
import { aliasResolver } from '../../src/core/codeGeneration/imports/aliasResolver';
import { dependencyResolver } from '../../src/core/codeGeneration/imports/dependencyResolver';
import { importSorter } from '../../src/core/codeGeneration/imports/importSorter';
import { importOptimizer } from '../../src/core/codeGeneration/imports/importOptimizer';
import { importAnalyzer } from '../../src/core/codeGeneration/imports/importAnalyzer';
import { importEngine } from '../../src/core/codeGeneration/imports/importEngine';

describe('Import Resolution Engine Tests', () => {
  describe('Validator & Dependencies checks', () => {
    it('should throw error on broken path source names', () => {
      const imps = [{ source: '', specifiers: ['sym'], kind: 'named' as const }];
      assert.throws(() => {
        importValidator.validateImports(imps, 'src/main.ts');
      }, /Broken import path source/);
    });

    it('should throw error on circular self-reference imports', () => {
      const imps = [{ source: 'src/main.ts', specifiers: ['sym'], kind: 'named' as const }];
      assert.throws(() => {
        importValidator.validateImports(imps, 'src/main.ts');
      }, /Circular import detected/);
    });

    it('should verify layer checks constraints', () => {
      const isAllowed = dependencyResolver.verifyDependency('src/core/base', 'src/common/utils.ts');
      assert.strictEqual(isAllowed, false);
    });
  });

  describe('Alias, Sorters & Optimizers', () => {
    it('should expand alias keywords accurately', () => {
      assert.strictEqual(aliasResolver.resolveAlias('@/core/base'), 'src/core/base');
      assert.strictEqual(aliasResolver.resolveAlias('lodash'), 'lodash');
    });

    it('should sort imports weight categories topologically', () => {
      const imps = [
        { source: './relative', specifiers: ['rel'], kind: 'named' as const },
        { source: 'fs', specifiers: ['fs'], kind: 'named' as const },
        { source: '@/core/base', specifiers: ['base'], kind: 'named' as const },
        { source: 'lodash', specifiers: ['lodash'], kind: 'named' as const }
      ];
      const sorted = importSorter.sort(imps);
      assert.strictEqual(sorted[0].source, 'fs');
      assert.strictEqual(sorted[1].source, 'lodash');
      assert.strictEqual(sorted[2].source, 'src/core/base');
      assert.strictEqual(sorted[3].source, './relative');
    });

    it('should merge duplicate imports specifiers', () => {
      const imps = [
        { source: 'react', specifiers: ['useState'], kind: 'named' as const },
        { source: 'react', specifiers: ['useEffect'], kind: 'named' as const }
      ];
      const { optimized, duplicates } = importOptimizer.optimize(imps);
      assert.strictEqual(optimized.length, 1);
      assert.strictEqual(optimized[0].specifiers.length, 2);
      assert.strictEqual(duplicates.length, 1);
    });
  });

  describe('Parser & Orchestration', () => {
    it('should parse content string extracting imports list', () => {
      const content = 'import { useState } from "react";\nexport class Component {}';
      const parsed = importAnalyzer.parseExisting(content);
      assert.strictEqual(parsed.length, 1);
      assert.strictEqual(parsed[0].source, 'react');
    });

    it('should resolve imports compiling final resolution report', async () => {
      const report = await importEngine.resolveImports(
        'src/core/baseController.ts',
        'import { Base } from "./base";\n',
        ['useState', 'fs']
      );

      assert.strictEqual(report.targetFile, 'src/core/baseController.ts');
      assert.strictEqual(report.resolvedImports.length, 3);
      assert.strictEqual(report.confidence, 0.95);
    });
  });
});
