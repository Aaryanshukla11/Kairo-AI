import * as assert from 'assert';
import { consistencyValidator } from '../../src/core/codeGeneration/multiFile/consistencyValidator';
import { orderingEngine } from '../../src/core/codeGeneration/multiFile/orderingEngine';
import { generationCoordinator } from '../../src/core/codeGeneration/multiFile/generationCoordinator';

describe('Multi-file Generation Engine Tests', () => {
  describe('Operations and Conflicts Validations', () => {
    it('should reject plans containing duplicate file targets', () => {
      const ops = [
        { filePath: 'src/base.ts', operation: 'create' as const, dependencies: [] },
        { filePath: 'src/base.ts', operation: 'modify' as const, dependencies: [] }
      ];
      assert.throws(() => {
        consistencyValidator.validateOperations(ops);
      }, /Duplicate file target detected/);
    });

    it('should reject moves/renames referencing original paths flagged for deletion', () => {
      const ops = [
        { filePath: 'src/old.ts', operation: 'delete' as const, dependencies: [] },
        { filePath: 'src/new.ts', operation: 'rename' as const, dependencies: [], originalPath: 'src/old.ts' }
      ];
      assert.throws(() => {
        consistencyValidator.validateOperations(ops);
      }, /Conflicting operations detected/);
    });

    it('should reject dependencies referring to undefined targets', () => {
      const ops = [
        { filePath: 'src/main.ts', operation: 'create' as const, dependencies: ['src/missing.ts'] }
      ];
      assert.throws(() => {
        consistencyValidator.validateGraph(ops, ['src/main.ts']);
      }, /depends on undefined path/);
    });
  });

  describe('Topological Ordering and Cycles Detection', () => {
    it('should determine correct order based on dependencies', () => {
      const ops = [
        { filePath: 'src/root.ts', operation: 'create' as const, dependencies: [] },
        { filePath: 'src/child.ts', operation: 'create' as const, dependencies: ['src/root.ts'] },
        { filePath: 'src/leaf.ts', operation: 'create' as const, dependencies: ['src/child.ts'] }
      ];
      const order = orderingEngine.computeOrder(ops);
      assert.deepStrictEqual(order, ['src/root.ts', 'src/child.ts', 'src/leaf.ts']);
    });

    it('should throw an exception when circular cycles are present', () => {
      const ops = [
        { filePath: 'src/a.ts', operation: 'modify' as const, dependencies: ['src/b.ts'] },
        { filePath: 'src/b.ts', operation: 'modify' as const, dependencies: ['src/a.ts'] }
      ];
      assert.throws(() => {
        orderingEngine.computeOrder(ops);
      }, /Circular dependency generation order cycle detected/);
    });
  });

  describe('Generation Plan Compilation', () => {
    it('should execute generationCoordinator pipeline and compile plans metrics', async () => {
      const plan = {
        operations: [
          { filePath: 'src/baseController.ts', operation: 'create', dependencies: [] },
          { filePath: 'src/agentController.ts', operation: 'create', dependencies: ['src/baseController.ts'] }
        ]
      };
      const result = await generationCoordinator.coordinate(plan);
      assert.ok(result.generationId.startsWith('multi-plan-'));
      assert.strictEqual(result.affectedFiles.length, 2);
      assert.deepStrictEqual(result.creationOrder, ['src/baseController.ts', 'src/agentController.ts']);
      assert.strictEqual(result.generatedArtifacts.length, 2);
      assert.strictEqual(result.validationSummary.isValid, true);
    });
  });
});
