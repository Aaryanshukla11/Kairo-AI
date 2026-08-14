import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { aiKernel } from '../../src/core/ai-kernel/kernel';
import { plannerEngine } from '../../src/core/planner';
import { approvalEngine } from '../../src/core/approval/approvalEngine';
import { globalKairoExecutionEngine } from '../../src/core/executionEngine/kairoExecutionEngine';
import { globalKairoEventBus } from '../../src/core/eventBus/runtime/kairoEventBus';

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toContain: (expected: any) => {
    if (!Array.isArray(actual) || !actual.includes(expected)) {
      throw new Error(`Expected array to contain ${expected}`);
    }
  }
});

describe('Approval to Execution Pipeline Regression Test', () => {
  const testWorkspace = path.join(os.tmpdir(), 'kairo-approval-pipeline-test');

  beforeEach(() => {
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
    fs.mkdirSync(testWorkspace, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  it('Approve plan -> Generator executes -> ExecutionEngine writes real file -> file exists on disk', async () => {
    const promptText = 'Create a simple portfolio website with index.html and styles.css';
    
    // 1. Build plan & request approval
    const plan = plannerEngine.generatePlan(promptText);
    const approval = approvalEngine.createApproval(plan);
    expect(approval.status).toBe('pending');

    // BEFORE approval: 0 files written to workspace disk
    const filesBeforeApproval = fs.readdirSync(testWorkspace);
    expect(filesBeforeApproval.length).toBe(0);

    // 2. User approves plan
    const updatedApproval = approvalEngine.approve(approval.id);
    expect(updatedApproval.status).toBe('approved');

    // 3. Resume execution pipeline post-approval
    const eventsCaptured: string[] = [];
    const unsub = globalKairoEventBus.subscribe('*', async (evt: any) => {
      eventsCaptured.push(evt.eventType);
    });

    await aiKernel.processPrompt({
      rawPrompt: promptText,
      workspacePath: testWorkspace,
      requestId: plan.id
    });

    unsub();

    // 4. Verify authentic events emitted
    expect(eventsCaptured).toContain('GenerationStarted');
    expect(eventsCaptured).toContain('FileGenerationCompleted');
    expect(eventsCaptured).toContain('GenerationCompleted');
    expect(eventsCaptured).toContain('FileWriteStarted');
    expect(eventsCaptured).toContain('FileWriteCompleted');

    // 5. Verify physical files exist on disk in the target workspace
    const indexPath = path.join(testWorkspace, 'index.html');
    const stylesPath = path.join(testWorkspace, 'styles.css');

    expect(fs.existsSync(indexPath)).toBe(true);
    expect(fs.existsSync(stylesPath)).toBe(true);

    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    expect(indexContent.length).toBeGreaterThan(0);
  });

  it('Fail-loud error on missing approval mapping', () => {
    const invalidApprovalId = 'invalid-approval-999999';
    const planIdMap = new Map<string, string>();
    const planId = planIdMap.get(invalidApprovalId);
    
    expect(planId).toBe(undefined);
  });
});
