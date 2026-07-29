import * as assert from 'assert';
import { GenerationStrategy, GenEventType } from '../../src/core/codeGeneration/generationTypes';
import { generationValidator } from '../../src/core/codeGeneration/generationValidator';
import { generationPlanner } from '../../src/core/codeGeneration/generationPlanner';
import { generationPolicies } from '../../src/core/codeGeneration/generationPolicies';
import { mockGenerator } from '../../src/core/codeGeneration/providers/mockGenerator';
import { generationCoordinator } from '../../src/core/codeGeneration/generationCoordinator';
import { generationSessionManager } from '../../src/core/codeGeneration/generationSession';
import { generationEvents } from '../../src/core/codeGeneration/generationEvents';

describe('Code Generation Engine Tests', () => {
  describe('Validation Rules', () => {
    it('should reject requests missing tasks details', () => {
      assert.throws(() => {
        generationValidator.validatePlan(null);
      }, /Missing execution plan/);

      assert.throws(() => {
        generationValidator.validatePlan({ tasks: [] });
      }, /Missing plan tasks/);
    });

    it('should reject unsupported generation languages', () => {
      assert.throws(() => {
        generationValidator.validateContext({
          planId: 'plan-1',
          targetPath: 'src',
          language: 'python' as any,
          projectConventions: []
        });
      }, /Unsupported language/);
    });

    it('should reject invalid strategies names', () => {
      assert.throws(() => {
        generationValidator.validateStrategy('CompileBinary');
      }, /Invalid strategy/);
    });
  });

  describe('Conventions and Strategy Planning', () => {
    it('should select Refactor strategy for refactoring tasks titles', () => {
      const plan = { title: 'Refactor smells in agent registries' };
      const strategy = generationPlanner.selectStrategy(plan);
      assert.strictEqual(strategy, GenerationStrategy.Refactor);
    });

    it('should block contexts matching RESTRICT_WRITE policies rules', () => {
      const context = {
        planId: 'p1',
        targetPath: 'src',
        language: 'typescript' as const,
        projectConventions: ['RESTRICT_WRITE']
      };
      assert.throws(() => {
        generationPolicies.verifyPolicies(context);
      }, /prohibited by policies/);
    });
  });

  describe('Template Generation and Sessions Coordination', () => {
    it('should build ts class templates in mock generators', async () => {
      const context = {
        planId: 'p1',
        targetPath: 'src/core/generated',
        language: 'typescript' as const,
        projectConventions: []
      };
      const files = await mockGenerator.generate(context, GenerationStrategy.CreateNewFeature, { title: 'Controller' });
      assert.strictEqual(files.length, 1);
      assert.strictEqual(files[0].path, 'src/core/generated/controller.ts');
      assert.ok(files[0].content.includes('export class Controller'));
    });

    it('should execute generationCoordinator pipeline successfully returning artifacts', async () => {
      const plan = {
        planId: 'plan-coord-1',
        title: 'Scaffold registry controllers',
        language: 'typescript',
        targetPath: 'src/core/generated',
        tasks: [{ id: 't1', desc: 'desc' }]
      };

      const artifact = await generationCoordinator.coordinate(plan);
      assert.ok(artifact.generationId.startsWith('gen-art-'));
      assert.strictEqual(artifact.strategyUsed, GenerationStrategy.Scaffold);
      assert.strictEqual(artifact.files.length, 1);
      assert.ok(artifact.files[0].content.includes('Assembled Code Output'));
    });
  });
});
