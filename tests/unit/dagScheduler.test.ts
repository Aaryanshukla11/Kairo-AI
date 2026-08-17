import * as assert from 'assert';
import { scheduleTaskDag, IDagTask } from '../../src/core/planner/dagScheduler';

describe('Chunk 7.8 - Task-DAG Scheduler Unit Tests', () => {

  // Test 1: Single task executes
  it('should schedule a single task at Level-0', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Task 1', targetFiles: ['index.html'], requiredCapability: 'html', dependencies: [] }
    ];

    const result = scheduleTaskDag(tasks);
    assert.strictEqual(result.levels.length, 1);
    assert.strictEqual(result.levels[0].tasks.length, 1);
    assert.strictEqual(result.levels[0].tasks[0].id, 't1');
  });

  // Test 2: Two independent tasks execute at same DAG level
  it('should place independent tasks at the same level (Level-0)', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Task 1', targetFiles: ['index.html'], requiredCapability: 'html', dependencies: [] },
      { id: 't2', title: 'Task 2', targetFiles: ['styles.css'], requiredCapability: 'css', dependencies: [] }
    ];

    const result = scheduleTaskDag(tasks);
    assert.strictEqual(result.levels.length, 1);
    assert.strictEqual(result.levels[0].tasks.length, 2);
    assert.deepStrictEqual(result.levels[0].tasks.map(t => t.id).sort(), ['t1', 't2']);
  });

  // Test 3: Linear dependency chain (A -> B -> C)
  it('should schedule linear dependencies sequentially in separate levels', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Config', targetFiles: ['package.json'], requiredCapability: 'config', dependencies: [] },
      { id: 't2', title: 'Server', targetFiles: ['src/server.ts'], requiredCapability: 'backend', dependencies: ['t1'] },
      { id: 't3', title: 'Docs', targetFiles: ['README.md'], requiredCapability: 'documentation', dependencies: ['t2'] }
    ];

    const result = scheduleTaskDag(tasks);
    assert.strictEqual(result.levels.length, 3);
    assert.strictEqual(result.levels[0].tasks[0].id, 't1');
    assert.strictEqual(result.levels[1].tasks[0].id, 't2');
    assert.strictEqual(result.levels[2].tasks[0].id, 't3');
  });

  // Test 4: Branching dependency graph
  it('should handle branching dependency graph correctly', () => {
    // A -> B, C -> D -> E
    const tasks: IDagTask[] = [
      { id: 'A', title: 'Config', targetFiles: ['package.json'], requiredCapability: 'config', dependencies: [] },
      { id: 'B', title: 'Server', targetFiles: ['src/server.ts'], requiredCapability: 'backend', dependencies: ['A'] },
      { id: 'C', title: 'DB', targetFiles: ['src/db.ts'], requiredCapability: 'database', dependencies: ['A'] },
      { id: 'D', title: 'Routes', targetFiles: ['src/routes.ts'], requiredCapability: 'api', dependencies: ['B'] },
      { id: 'E', title: 'Docs', targetFiles: ['README.md'], requiredCapability: 'documentation', dependencies: ['D'] }
    ];

    const result = scheduleTaskDag(tasks);
    assert.strictEqual(result.levels.length, 4);
    assert.strictEqual(result.levels[0].tasks[0].id, 'A');
    assert.deepStrictEqual(result.levels[1].tasks.map(t => t.id).sort(), ['B', 'C']);
    assert.strictEqual(result.levels[2].tasks[0].id, 'D');
    assert.strictEqual(result.levels[3].tasks[0].id, 'E');
  });

  // Test 5: Invalid dependency rejected
  it('should throw error when referencing non-existent dependency ID', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Task 1', targetFiles: ['index.html'], requiredCapability: 'html', dependencies: ['missing-id'] }
    ];

    assert.throws(() => {
      scheduleTaskDag(tasks);
    }, /references missing dependency/);
  });

  // Test 6: Duplicate task ID rejected
  it('should throw error on duplicate task ID', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Task 1', targetFiles: ['index.html'], requiredCapability: 'html', dependencies: [] },
      { id: 't1', title: 'Task 2', targetFiles: ['styles.css'], requiredCapability: 'css', dependencies: [] }
    ];

    assert.throws(() => {
      scheduleTaskDag(tasks);
    }, /Duplicate task ID/);
  });

  // Test 7: Dependency cycle rejected
  it('should detect and reject dependency cycles', () => {
    // A -> B -> C -> A
    const tasks: IDagTask[] = [
      { id: 'A', title: 'Task A', targetFiles: ['a.ts'], requiredCapability: 'utilities', dependencies: ['C'] },
      { id: 'B', title: 'Task B', targetFiles: ['b.ts'], requiredCapability: 'utilities', dependencies: ['A'] },
      { id: 'C', title: 'Task C', targetFiles: ['c.ts'], requiredCapability: 'utilities', dependencies: ['B'] }
    ];

    assert.throws(() => {
      scheduleTaskDag(tasks);
    }, /Dependency cycle detected/);
  });

  // Test 8: Empty task list rejected
  it('should reject empty task list', () => {
    assert.throws(() => {
      scheduleTaskDag([]);
    }, /Task list cannot be empty/);
  });

  // Test 9: Missing targetFiles rejected
  it('should reject task with empty targetFiles array', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Task 1', targetFiles: [], requiredCapability: 'html', dependencies: [] }
    ];

    assert.throws(() => {
      scheduleTaskDag(tasks);
    }, /missing valid targetFiles/);
  });

  // Test 10: Missing requiredCapability rejected
  it('should reject task with missing requiredCapability', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Task 1', targetFiles: ['index.html'], requiredCapability: '', dependencies: [] }
    ];

    assert.throws(() => {
      scheduleTaskDag(tasks);
    }, /missing valid requiredCapability/);
  });

  // Test 11: Regression check - SMALL complexity with 5 tasks does not prune tasks
  it('should retain all 5 tasks regardless of complexity rating', () => {
    const tasks: IDagTask[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      targetFiles: [`file${i}.ts`],
      requiredCapability: 'utilities',
      dependencies: []
    }));

    const result = scheduleTaskDag(tasks);
    assert.strictEqual(result.sortedTaskIds.length, 5);
  });

  // Test 12: Regression check - COMPLEX complexity with 1 task does not invent extra phases
  it('should retain strictly 1 task for single task request even with COMPLEX rating', () => {
    const tasks: IDagTask[] = [
      { id: 't1', title: 'Single Task', targetFiles: ['index.html'], requiredCapability: 'html', dependencies: [] }
    ];

    const result = scheduleTaskDag(tasks);
    assert.strictEqual(result.levels.length, 1);
    assert.strictEqual(result.levels[0].tasks.length, 1);
  });
});
