import * as assert from 'assert';
import { generatorSDK } from '../../src/core/agents/generatorSDK/generatorSDK';

const expect = (actual: any) => ({
  toBe: (expected: any) => assert.strictEqual(actual, expected),
  toEqual: (expected: any) => assert.deepStrictEqual(actual, expected),
  toContain: (expected: any) => {
    if (typeof actual === 'string') {
      assert.ok(actual.includes(expected), `Expected '${actual}' to contain '${expected}'`);
    } else if (Array.isArray(actual)) {
      assert.ok(actual.includes(expected), `Expected array to contain '${expected}'`);
    }
  }
});

describe('GeneratorSDK Optimization #4 — Dependency-Aware Parallel Execution', () => {
  test('Constructs correct dependency waves for independent and dependent tasks', () => {
    const tasks = [
      { id: 't1', generatorId: 'ConfigGenerator', dependencies: [], targetFiles: ['package.json'] },
      { id: 't2', generatorId: 'DatabaseGeneratorSDK', dependencies: [], targetFiles: ['src/db/schema.ts'] },
      { id: 't3', generatorId: 'SharedUtilGenerator', dependencies: ['t1'], targetFiles: ['src/common/utils.ts'] },
      { id: 't4', generatorId: 'BackendGenerator', dependencies: ['t3'], targetFiles: ['src/services/apiService.ts'] },
      { id: 't5', generatorId: 'AuthGeneratorSDK', dependencies: ['t2'], targetFiles: ['src/auth/authService.ts'] }
    ];

    const waves = generatorSDK.buildExecutionWaves(tasks);

    expect(waves.length).toBe(3);
    // Wave 1: t1, t2
    expect(waves[0].map(t => t.id)).toEqual(['t1', 't2']);
    // Wave 2: t3, t5
    expect(waves[1].map(t => t.id)).toEqual(['t3', 't5']);
    // Wave 3: t4
    expect(waves[2].map(t => t.id)).toEqual(['t4']);
  });

  test('Resolves file conflicts by pushing conflicting tasks to subsequent waves', () => {
    const tasksWithConflict = [
      { id: 't1', generatorId: 'ConfigGenerator', dependencies: [], targetFiles: ['package.json'] },
      { id: 't2', generatorId: 'CustomGeneratorA', dependencies: [], targetFiles: ['package.json'] } // Same file conflict!
    ];

    const waves = generatorSDK.buildExecutionWaves(tasksWithConflict);

    expect(waves.length).toBe(2);
    expect(waves[0].map(t => t.id)).toEqual(['t1']);
    expect(waves[1].map(t => t.id)).toEqual(['t2']);
  });
});
