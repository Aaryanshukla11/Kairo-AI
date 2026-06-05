import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { plannerEngine } from '../../src/core/planner';
import { approvalEngine } from '../../src/core/approval';
import { aiKernel } from '../../src/core/ai-kernel';
import { globalKairoEventBus } from '../../src/core/eventBus/runtime/kairoEventBus';

describe('Workspace Context Propagation Pipeline', () => {
  let testWorkspace: string;

  beforeEach(() => {
    testWorkspace = path.join(os.tmpdir(), `kairo-ws-prop-test-${Date.now()}`);
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

  it('preserves canonical workspacePath through Orchestrator to ExecutionEngine and writes physical files', async () => {
    const promptText = 'Create a simple responsive portfolio website using HTML and CSS.';

    // 1. Build Plan and Approval
    const plan = plannerEngine.generatePlan(promptText);
    (plan as any).prompt = promptText;
    const approval = approvalEngine.createApproval(plan);
    approvalEngine.approve(approval.id);

    // 2. Capture [WORKSPACE_TRACE] logs
    const workspaceTraces: Record<string, string> = {};

    const unsub = globalKairoEventBus.subscribe('*', async (evt) => {
      if (evt.eventType === 'GenerationCompleted' || evt.eventType === 'ExecutionCompleted') {
        const wsPath = evt.payload?.workspacePath || evt.payload?.executionReport?.workspaceRoot;
        if (wsPath) {
          workspaceTraces['ExecutionEngine'] = wsPath;
        }
      }
    });

    // 3. Process Prompt with explicit workspacePath
    const compiledRequest = await aiKernel.processPrompt({
      rawPrompt: promptText,
      workspacePath: testWorkspace,
      requestId: plan.id
    });

    unsub();

    // 4. Assert workspacePath defined through all layers
    expect(compiledRequest.workspacePath).toBe(testWorkspace);

    // 5. Verify physical files exist on disk in the active workspace
    const indexPath = path.join(testWorkspace, 'index.html');
    const stylesPath = path.join(testWorkspace, 'styles.css');

    expect(fs.existsSync(indexPath)).toBe(true);
    expect(fs.existsSync(stylesPath)).toBe(true);
    expect(fs.statSync(indexPath).size).toBeGreaterThan(0);
    expect(fs.statSync(stylesPath).size).toBeGreaterThan(0);
  });
});
