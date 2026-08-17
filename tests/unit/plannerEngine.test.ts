import * as assert from 'assert';
import { ExecutionPlanner } from '../../src/core/planner/planner';
import { globalGeneratorRegistrySDK } from '../../src/core/agents/generatorSDK/generatorRegistrySDK';

describe('PlannerEngine Unit Tests - Capability-Driven Resolution', () => {
  const plannerEngine = new ExecutionPlanner();

  it('should extract targetFiles and requiredCapability "html" for "Create index.html"', () => {
    const plan = plannerEngine.generatePlan('Create index.html');
    assert.ok(plan.targetFiles);
    assert.deepStrictEqual(plan.targetFiles, ['index.html']);
    assert.strictEqual(plan.tasks.length, 1);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'html');
    
    const gen = globalGeneratorRegistrySDK.resolve(plan.tasks[0].requiredCapability!);
    assert.ok(gen);
    assert.strictEqual(gen?.id, 'UIComponentGenerator');
  });

  it('should extract targetFiles and requiredCapability "css" for "Create styles.css"', () => {
    const plan = plannerEngine.generatePlan('Create styles.css');
    assert.ok(plan.targetFiles);
    assert.deepStrictEqual(plan.targetFiles, ['styles.css']);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'css');

    const gen = globalGeneratorRegistrySDK.resolve(plan.tasks[0].requiredCapability!);
    assert.ok(gen);
    assert.strictEqual(gen?.id, 'UIComponentGenerator');
  });

  it('should extract targetFiles and requiredCapability "documentation" for "Create README.md"', () => {
    const plan = plannerEngine.generatePlan('Create README.md');
    assert.ok(plan.targetFiles);
    assert.deepStrictEqual(plan.targetFiles, ['README.md']);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'documentation');

    const gen = globalGeneratorRegistrySDK.resolve(plan.tasks[0].requiredCapability!);
    assert.ok(gen);
    assert.strictEqual(gen?.id, 'DocumentationGenerator');
  });

  it('should extract targetFiles and requiredCapability "config" for "Create package.json"', () => {
    const plan = plannerEngine.generatePlan('Create package.json');
    assert.ok(plan.targetFiles);
    assert.deepStrictEqual(plan.targetFiles, ['package.json']);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'config');

    const gen = globalGeneratorRegistrySDK.resolve(plan.tasks[0].requiredCapability!);
    assert.ok(gen);
    assert.strictEqual(gen?.id, 'ConfigGenerator');
  });

  it('should extract targetFiles and requiredCapability "utilities" for "Create src/utils.ts"', () => {
    const plan = plannerEngine.generatePlan('Create src/utils.ts');
    assert.ok(plan.targetFiles);
    assert.deepStrictEqual(plan.targetFiles, ['src/utils.ts']);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'utilities');

    const gen = globalGeneratorRegistrySDK.resolve(plan.tasks[0].requiredCapability!);
    assert.ok(gen);
    assert.strictEqual(gen?.id, 'SharedUtilGenerator');
  });

  it('should return undefined from GeneratorRegistrySDK for unsupported capability without defaulting', () => {
    const gen = globalGeneratorRegistrySDK.resolve('unsupported_magic_capability');
    assert.strictEqual(gen, undefined);
  });

  it('should fail honestly without static fallbacks for unspecified prompts when no proposal is provided', () => {
    assert.throws(() => {
      plannerEngine.generatePlan('Explain this function');
    }, /Planning Failed/);
  });
});
