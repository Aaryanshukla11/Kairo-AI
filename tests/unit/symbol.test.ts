import * as assert from 'assert';
import { symbolValidator } from '../../src/core/codeGeneration/symbols/symbolValidator';
import { namespaceResolver } from '../../src/core/codeGeneration/symbols/namespaceResolver';
import { overloadResolver } from '../../src/core/codeGeneration/symbols/overloadResolver';
import { symbolGraph } from '../../src/core/codeGeneration/symbols/symbolGraph';
import { symbolEngine } from '../../src/core/codeGeneration/symbols/symbolEngine';

describe('Symbol Resolution Engine Tests', () => {
  describe('Validator & Scope checks', () => {
    it('should throw error on duplicate defined names inside namespace', () => {
      const syms = [
        { name: 'Base', kind: 'Class' as const, visibility: 'public' as const, namespace: 'core' },
        { name: 'Base', kind: 'Class' as const, visibility: 'public' as const, namespace: 'core' }
      ];
      assert.throws(() => {
        symbolValidator.validateDefinitions(syms);
      }, /Duplicate definition detected/);
    });

    it('should throw error on visibility checks violation', () => {
      const sym = { name: 'Base', kind: 'Class' as const, visibility: 'private' as const, namespace: 'core' };
      assert.throws(() => {
        symbolValidator.validateVisibility(sym, 'common');
      }, /Visibility violation/);
    });

    it('should resolve namespace path hierarchies', () => {
      const ns = namespaceResolver.resolveNamespace('src/core/agents/agent.ts');
      assert.strictEqual(ns, 'src.core.agents');
    });
  });

  describe('Overloads, Graphs & Pipeline', () => {
    it('should distinguish overload signature parameter mappings', () => {
      const signature = overloadResolver.resolveOverload('query', ['string', 'number']);
      assert.strictEqual(signature, 'query(string, number)');
    });

    it('should assemble symbol graph edge lines links', () => {
      const graph = symbolGraph.buildGraph(['ClassA', 'ClassB']);
      assert.strictEqual(graph.nodes.length, 2);
      assert.strictEqual(graph.edges.length, 1);
      assert.strictEqual(graph.edges[0].from, 'ClassA');
    });

    it('should resolve symbols compiling final resolution report', async () => {
      const report = await symbolEngine.resolveSymbols(
        'src/core/baseController.ts',
        'export class BaseController {}\n',
        ['Base', 'Agent']
      );

      assert.strictEqual(report.resolvedSymbols.length, 3);
      assert.strictEqual(report.confidence, 0.95);
    });
  });
});
