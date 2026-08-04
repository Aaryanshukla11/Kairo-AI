import * as assert from 'assert';
import { ASTEventType } from '../../src/core/codeGeneration/ast/astTypes';
import { astValidator } from '../../src/core/codeGeneration/ast/astValidator';
import { astNormalizer } from '../../src/core/codeGeneration/ast/astNormalizer';
import { astOptimizer } from '../../src/core/codeGeneration/ast/astOptimizer';
import { astSerializer } from '../../src/core/codeGeneration/ast/astSerializer';
import { languageRegistry } from '../../src/core/codeGeneration/ast/languageRegistry';
import { astCoordinator } from '../../src/core/codeGeneration/ast/astCoordinator';
import { typescriptProvider } from '../../src/core/codeGeneration/ast/providers/typescriptProvider';
import { pythonProvider } from '../../src/core/codeGeneration/ast/providers/pythonProvider';

describe('AST Generation Engine Tests', () => {
  describe('Language Registry & Validation Rules', () => {
    it('should map typescript and python language providers correctly', () => {
      const tsProvider = languageRegistry.getProvider('typescript');
      assert.ok(tsProvider);
      
      const pyProvider = languageRegistry.getProvider('python');
      assert.ok(pyProvider);

      assert.throws(() => {
        languageRegistry.getProvider('Go');
      }, /Unsupported language/);
    });

    it('should reject trees with duplicate symbols definitions', () => {
      const artifact = {
        astId: 'ast-1',
        language: 'typescript' as const,
        rootNode: { type: 'Program' },
        symbols: [
          { name: 'DuplicateName', type: 'class' as const },
          { name: 'DuplicateName', type: 'function' as const }
        ],
        imports: [],
        exports: [],
        diagnostics: [],
        metadata: { nodesCount: 1, depth: 1, optimized: true }
      };

      assert.throws(() => {
        astValidator.validateTreeConsistency(artifact);
      }, /Duplicate symbol definition/);
    });
  });

  describe('AST Normalization & Optimizations checks', () => {
    it('should populate start and end node locations index ranges', () => {
      const root: any = {
        type: 'Program',
        children: [
          { type: 'ImportDeclaration', name: 'A', value: 'B' }
        ]
      };
      astNormalizer.normalize(root);
      assert.strictEqual(root.start, 0);
      assert.ok(root.end! > 0);
    });

    it('should prune dead EmptyStatement nodes from children array list', () => {
      const root = {
        type: 'Program',
        children: [
          { type: 'EmptyStatement' },
          { type: 'ClassDeclaration', name: 'Model' }
        ]
      };
      const optimized = astOptimizer.optimize(root);
      assert.strictEqual(optimized.children!.length, 1);
      assert.strictEqual(optimized.children![0].type, 'ClassDeclaration');
    });
  });

  describe('AST Serializers and Providers', () => {
    it('should serialize typescript declarations accurately', () => {
      const node = {
        type: 'ClassDeclaration',
        name: 'UserController',
        children: [
          { type: 'MethodDeclaration', name: 'getUser' }
        ]
      };
      const code = astSerializer.serialize(node);
      assert.ok(code.includes('export class UserController'));
      assert.ok(code.includes('public getUser()'));
    });

    it('should build python program structures using Python AST Providers', () => {
      const ir = {
        functions: [
          { name: 'calc_ratio' }
        ]
      };
      const rootNode = pythonProvider.buildAst(ir);
      assert.strictEqual(rootNode.type, 'Program');
      assert.strictEqual(rootNode.children!.length, 1);
      assert.strictEqual(rootNode.children![0].type, 'FunctionDeclaration');
      assert.strictEqual(rootNode.children![0].name, 'calc_ratio');
    });

    it('should run astCoordinator pipeline successfully transforming IR to ASTArtifact', async () => {
      const ir = {
        className: 'AgentService',
        imports: [
          { symbol: 'BaseService', source: '../base' }
        ],
        methods: [
          { name: 'registerAgent' }
        ]
      };
      const artifact = await astCoordinator.coordinate(ir, 'typescript');
      assert.ok(artifact.astId.startsWith('ast-'));
      assert.strictEqual(artifact.language, 'typescript');
      assert.strictEqual(artifact.metadata.optimized, true);
      assert.strictEqual(artifact.symbols.length, 2); // Class + Method
    });
  });
});
