import * as assert from 'assert';
import { ExecutionPlanner } from '../../src/core/planner/planner';
import { validatePlanProposal, IPlanProposal } from '../../src/core/planner/plannerModel';

describe('Chunk 7.7 - Hybrid Planner Unit Tests', () => {

  const planner = new ExecutionPlanner();

  // Test 1: Explicit index.html -> Deterministic Fast-Path
  it('should use deterministic fast-path for explicit index.html without calling LLM planner', () => {
    const plan = planner.generatePlan('Create index.html');
    assert.deepStrictEqual(plan.targetFiles, ['index.html']);
    assert.strictEqual(plan.tasks.length, 1);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'html');
  });

  // Test 2: Explicit README.md -> Deterministic Fast-Path
  it('should use deterministic fast-path for explicit README.md', () => {
    const plan = planner.generatePlan('Create README.md');
    assert.deepStrictEqual(plan.targetFiles, ['README.md']);
    assert.strictEqual(plan.tasks.length, 1);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'documentation');
  });

  // Test 3: Multiple explicit files -> Deterministic Fast-Path
  it('should use deterministic fast-path for multiple explicit filenames', () => {
    const plan = planner.generatePlan('Create index.html and app.js');
    assert.deepStrictEqual(plan.targetFiles, ['index.html', 'app.js']);
    assert.strictEqual(plan.tasks.length, 2);
  });

  // Test 4: FastAPI backend -> LLM proposal path
  it('should generate plan for FastAPI backend from valid LLM proposal', () => {
    const mockProposal: IPlanProposal = {
      tasks: [
        {
          id: 'task-fastapi-1',
          title: 'Dependencies',
          targetFiles: ['requirements.txt'],
          requiredCapability: 'config',
          operation: 'CREATE_FILE'
        },
        {
          id: 'task-fastapi-2',
          title: 'Main App',
          targetFiles: ['main.py'],
          requiredCapability: 'utilities',
          operation: 'CREATE_FILE',
          dependencies: ['task-fastapi-1']
        }
      ]
    };

    const plan = planner.generatePlan('Create a FastAPI backend', { proposal: mockProposal });
    assert.deepStrictEqual(plan.targetFiles, ['requirements.txt', 'main.py']);
    assert.strictEqual(plan.tasks.length, 2);
  });

  // Test 5: React application -> LLM proposal path
  it('should generate plan for React application from valid LLM proposal', () => {
    const mockProposal: IPlanProposal = {
      tasks: [
        {
          id: 'task-react-1',
          title: 'Package Config',
          targetFiles: ['package.json'],
          requiredCapability: 'config',
          operation: 'CREATE_FILE'
        },
        {
          id: 'task-react-2',
          title: 'React App Component',
          targetFiles: ['src/App.tsx'],
          requiredCapability: 'ui_components',
          operation: 'CREATE_FILE',
          dependencies: ['task-react-1']
        }
      ]
    };

    const plan = planner.generatePlan('Create a React application', { proposal: mockProposal });
    assert.deepStrictEqual(plan.targetFiles, ['package.json', 'src/App.tsx']);
    assert.strictEqual(plan.tasks.length, 2);
  });

  // Test 6: Express REST API -> LLM proposal path
  it('should generate plan for Express REST API from valid LLM proposal', () => {
    const mockProposal: IPlanProposal = {
      tasks: [
        {
          id: 'task-express-1',
          title: 'Express Server',
          targetFiles: ['src/server.ts'],
          requiredCapability: 'backend',
          operation: 'CREATE_FILE'
        }
      ]
    };

    const plan = planner.generatePlan('Build an Express REST API', { proposal: mockProposal });
    assert.deepStrictEqual(plan.targetFiles, ['src/server.ts']);
    assert.strictEqual(plan.tasks[0].requiredCapability, 'backend');
  });

  // Test 7: LLM malformed proposal -> Planning failure
  it('should throw error when proposal is malformed (not JSON object)', () => {
    assert.throws(() => {
      validatePlanProposal("invalid string");
    }, /Plan proposal must be a valid JSON object/);
  });

  // Test 8: LLM proposes ../secret.txt -> Rejected
  it('should reject proposal containing path escape ../', () => {
    const badProposal = {
      tasks: [
        {
          id: 't1',
          title: 'Bad Task',
          targetFiles: ['../secret.txt'],
          requiredCapability: 'utilities'
        }
      ]
    };
    assert.throws(() => {
      validatePlanProposal(badProposal);
    }, /unauthorized or unsafe file path/);
  });

  // Test 9: LLM proposes absolute path -> Rejected
  it('should reject proposal containing absolute paths or drive letters', () => {
    const badProposal = {
      tasks: [
        {
          id: 't1',
          title: 'Bad Task',
          targetFiles: ['C:\\Windows\\system32\\cmd.exe'],
          requiredCapability: 'utilities'
        }
      ]
    };
    assert.throws(() => {
      validatePlanProposal(badProposal);
    }, /unauthorized or unsafe file path/);
  });

  // Test 10: LLM proposes invalid task array -> Rejected
  it('should reject proposal with empty tasks array', () => {
    const badProposal = { tasks: [] };
    assert.throws(() => {
      validatePlanProposal(badProposal);
    }, /non-empty "tasks" array/);
  });

  // Test 11: LLM proposes duplicate task IDs -> Rejected
  it('should reject proposal containing duplicate task IDs', () => {
    const badProposal = {
      tasks: [
        { id: 't1', title: 'A', targetFiles: ['a.txt'], requiredCapability: 'config' },
        { id: 't1', title: 'B', targetFiles: ['b.txt'], requiredCapability: 'config' }
      ]
    };
    assert.throws(() => {
      validatePlanProposal(badProposal);
    }, /Duplicate task ID found/);
  });

  // Test 12: LLM proposes invalid dependency -> Rejected
  it('should reject proposal with non-existent dependency ID', () => {
    const badProposal = {
      tasks: [
        { id: 't1', title: 'A', targetFiles: ['a.txt'], requiredCapability: 'config', dependencies: ['non-existent-task'] }
      ]
    };
    assert.throws(() => {
      validatePlanProposal(badProposal);
    }, /invalid dependency ID/);
  });

  // Test 13: LLM planner failure -> No static fallback (Fails honestly)
  it('should fail honestly without static fallbacks when unspecified prompt lacks proposal', () => {
    assert.throws(() => {
      planner.generatePlan('Create a FastAPI backend');
    }, /Planning Failed: Unspecified request.*requires a valid LLM plan proposal/);
  });

  // Test 14: Existing modification request -> MODIFY_FILE semantics
  it('should support MODIFY_FILE operation semantics in proposals', () => {
    const modifyProposal: IPlanProposal = {
      tasks: [
        {
          id: 'mod-1',
          title: 'Update Styles',
          targetFiles: ['styles.css'],
          requiredCapability: 'css',
          operation: 'MODIFY_FILE'
        }
      ]
    };
    const plan = planner.generatePlan('Make hero section darker', { proposal: modifyProposal });
    assert.deepStrictEqual(plan.targetFiles, ['styles.css']);
  });

  // Test 15: LLM proposes filename in dependencies -> Auto-mapped to task ID
  it('should gracefully resolve filename dependencies to matching task IDs in proposals', () => {
    const filenameDepProposal = {
      tasks: [
        { id: 'task-1', title: 'HTML', targetFiles: ['index.html'], requiredCapability: 'html' },
        { id: 'task-2', title: 'CSS', targetFiles: ['styles.css'], requiredCapability: 'css', dependencies: ['index.html'] }
      ]
    };
    const validated = validatePlanProposal(filenameDepProposal);
    assert.deepStrictEqual(validated.tasks[1].dependencies, ['task-1']);
  });
});
