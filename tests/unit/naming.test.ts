import * as assert from 'assert';
import { namingValidator } from '../../src/core/codeGeneration/naming/namingValidator';
import { collisionDetector } from '../../src/core/codeGeneration/naming/collisionDetector';
import { abbreviationEngine } from '../../src/core/codeGeneration/naming/abbreviationEngine';
import { reactNaming } from '../../src/core/codeGeneration/naming/providers/reactNaming';
import { namingGenerator } from '../../src/core/codeGeneration/naming/namingGenerator';
import { namingAnalyzer } from '../../src/core/codeGeneration/naming/namingAnalyzer';

describe('Naming Intelligence Engine Tests', () => {
  describe('Naming Validator and Collision Checks', () => {
    it('should throw error when name is empty or too short', () => {
      assert.throws(() => {
        namingValidator.validateName('', 'Service');
      }, /Name string cannot be empty/);

      assert.throws(() => {
        namingValidator.validateName('ab', 'Service');
      }, /too short and ambiguous/);
    });

    it('should throw error on reserved language keywords', () => {
      assert.throws(() => {
        namingValidator.validateName('class', 'Class');
      }, /is a reserved language keyword/);
    });

    it('should flag collisions when name matches existing files list', () => {
      const collision = collisionDetector.checkCollision('authController', ['userController.ts', 'authController.ts']);
      assert.strictEqual(collision, true);
    });
  });

  describe('Abbreviation Engine & React naming rules checks', () => {
    it('should expand common developer abbreviations semantic names', () => {
      assert.strictEqual(abbreviationEngine.expand('auth'), 'authorization');
      assert.strictEqual(abbreviationEngine.expand('ctrl'), 'controller');
      assert.strictEqual(abbreviationEngine.expand('unknown'), 'unknown');
    });

    it('should verify reserved checks inside providers registry', () => {
      assert.strictEqual(reactNaming.isReserved('useState'), true);
      assert.strictEqual(reactNaming.isReserved('myCustomVar'), false);
    });
  });

  describe('Naming Generator Casing Conversions', () => {
    it('should convert strings to target casings rules', () => {
      const existing = ['userController.ts'];

      const reportCamel = namingGenerator.generateCandidates('authCtrl', 'Controller', 'camelCase', existing);
      assert.strictEqual(reportCamel.symbolName, 'authorizationController');

      const reportSnake = namingGenerator.generateCandidates('authCtrl', 'Controller', 'snakeCase', existing);
      assert.strictEqual(reportSnake.symbolName, 'authorization_controller');

      const reportPascal = namingGenerator.generateCandidates('authCtrl', 'Controller', 'PascalCase', existing);
      assert.strictEqual(reportPascal.symbolName, 'AuthorizationController');
    });
  });

  describe('Naming Analyzer Pipeline', () => {
    it('should run naming pipeline resolving candidate suggestions', () => {
      const existing = ['userController.ts'];
      const report = namingAnalyzer.analyzeAndGenerate('authCtrl', 'Controller', 'camelCase', existing);
      assert.strictEqual(report.symbolName, 'authorizationController');
      assert.strictEqual(report.alternativeNames.length, 2);
      assert.strictEqual(report.confidenceScore, 0.95);
    });
  });
});
