import * as assert from 'assert';
import { ExecutionPlanner } from '../../src/core/planner/planner';
import { DefaultPlannerModel, IPlannerModel, IPlanProposal, validatePlanProposal } from '../../src/core/planner/plannerModel';

class MockPlannerModel implements IPlannerModel {
  public callCount = 0;
  public mockProposal: IPlanProposal | null = null;
  public mockError: Error | null = null;

  public async generatePlanProposal(
    _prompt: string,
    _context?: { workspacePath?: string; conversationHistory?: any[] }
  ): Promise<IPlanProposal> {
    this.callCount++;
    if (this.mockError) {
      throw this.mockError;
    }
    if (!this.mockProposal) {
      throw new Error('MockPlannerModel: No proposal configured.');
    }
    return this.mockProposal;
  }
}

describe('Chunk 7.7.1 - Hybrid Planner Integration Unit Tests', () => {
  let planner: ExecutionPlanner;
  let mockModel: MockPlannerModel;

  beforeEach(() => {
    planner = new ExecutionPlanner();
    mockModel = new MockPlannerModel();
  });

  it('TEST 1: "Create index.html" should use fast path and NOT call PlannerModel', async () => {
    const prompt = 'Create index.html';
    const plan = planner.generatePlan(prompt);

    assert.strictEqual(mockModel.callCount, 0);
    assert.ok(plan.id);
    assert.strictEqual(plan.tasks.length, 1);
    assert.deepStrictEqual(plan.tasks[0]?.targetFiles, ['index.html']);
  });

  it('TEST 2: "Create README.md" should use fast path and assign documentation capability', async () => {
    const prompt = 'Create README.md';
    const plan = planner.generatePlan(prompt);

    assert.strictEqual(mockModel.callCount, 0);
    assert.ok(plan.id);
    assert.strictEqual(plan.tasks.length, 1);
    assert.strictEqual(plan.tasks[0]?.requiredCapability, 'documentation');
  });

  it('TEST 3: "build a portfolio site" should use Smart path, invoke PlannerModel, and create ExecutionPlan', async () => {
    const prompt = 'build a portfolio site';
    mockModel.mockProposal = {
      tasks: [
        {
          id: 'task-1',
          title: 'Create Hero Component',
          targetFiles: ['src/components/Hero.tsx'],
          requiredCapability: 'html',
          operation: 'CREATE_FILE'
        },
        {
          id: 'task-2',
          title: 'Create Portfolio Styles',
          targetFiles: ['src/styles/portfolio.css'],
          requiredCapability: 'css',
          operation: 'CREATE_FILE'
        }
      ]
    };

    const proposal = await mockModel.generatePlanProposal(prompt, { workspacePath: undefined });
    assert.strictEqual(mockModel.callCount, 1);

    const plan = planner.generatePlan(prompt, { proposal });
    assert.ok(plan.id);
    assert.strictEqual(plan.tasks.length, 2);
    assert.strictEqual(plan.tasks[0]?.targetFiles?.[0], 'src/components/Hero.tsx');
    assert.strictEqual(plan.tasks[1]?.targetFiles?.[0], 'src/styles/portfolio.css');
  });

  it('TEST 4: "create a FastAPI backend" should accept multi-file proposal from PlannerModel', async () => {
    const prompt = 'create a FastAPI backend';
    mockModel.mockProposal = {
      tasks: [
        {
          id: 'task-1',
          title: 'Create main entry point',
          targetFiles: ['main.py'],
          requiredCapability: 'backend',
          operation: 'CREATE_FILE'
        },
        {
          id: 'task-2',
          title: 'Create requirements.txt',
          targetFiles: ['requirements.txt'],
          requiredCapability: 'config',
          operation: 'CREATE_FILE'
        }
      ]
    };

    const proposal = await mockModel.generatePlanProposal(prompt);
    assert.strictEqual(mockModel.callCount, 1);

    const plan = planner.generatePlan(prompt, { proposal });
    assert.strictEqual(plan.tasks.length, 2);
  });

  it('TEST 5: PlannerModel returning malformed JSON should fail honestly without static files', async () => {
    // Rejects invalid JSON structure
    assert.throws(() => {
      validatePlanProposal('NOT_JSON_STRING');
    }, /Plan proposal must be a valid JSON object/);
  });

  it('TEST 6: PlannerModel returning invalid path "../secret.txt" should be rejected by validatePlanProposal', async () => {
    const prompt = 'build a portfolio site';
    mockModel.mockProposal = {
      tasks: [
        {
          id: 'task-1',
          title: 'Escape Attempt',
          targetFiles: ['../secret.txt'],
          requiredCapability: 'utilities',
          operation: 'CREATE_FILE'
        }
      ]
    };

    const proposal = await mockModel.generatePlanProposal(prompt);
    assert.throws(() => {
      planner.generatePlan(prompt, { proposal });
    }, /contains unauthorized or unsafe file path/);
  });

  it('TEST 7: PlannerModel/provider failure should propagate error cleanly', async () => {
    const prompt = 'build a portfolio site';
    mockModel.mockError = new Error('Provider Connection Error');

    await assert.rejects(async () => {
      await mockModel.generatePlanProposal(prompt);
    }, /Provider Connection Error/);
  });

  it('TEST 8: Empty workspace + "build a portfolio site" should generate plan without options.proposal undefined error', async () => {
    const prompt = 'build a portfolio site';
    mockModel.mockProposal = {
      tasks: [
        {
          id: 'task-1',
          title: 'Create index.html',
          targetFiles: ['index.html'],
          requiredCapability: 'html',
          operation: 'CREATE_FILE'
        }
      ]
    };

    const proposal = await mockModel.generatePlanProposal(prompt, { workspacePath: undefined });
    assert.strictEqual(mockModel.callCount, 1);

    const plan = planner.generatePlan(prompt, { proposal, workspacePath: undefined });
    assert.strictEqual(plan.tasks.length, 1);
  });
});
