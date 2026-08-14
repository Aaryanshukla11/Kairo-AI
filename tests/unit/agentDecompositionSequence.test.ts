import * as assert from 'assert';
import { aiKernel } from '../../src/core/ai-kernel/kernel';
import { orchestratorEngine } from '../../src/core/orchestrator/orchestratorEngine';
import { agentManager } from '../../src/core/agents/agentManager';
import { agentRegistry } from '../../src/core/agents/agentRegistry';

describe('Blocker #2 - Agent Decomposition & Execution Order Repair Tests', () => {

  beforeEach(() => {
    aiKernel.clearHistory();
    orchestratorEngine.clearHistory();
    agentManager.clearHistory();
  });

  it('TEST 1 & 2: "Create a commercial kitchen equipment manufacturer website." -> Must execute complete 10-agent sequence in exact order', async () => {
    const prompt = 'Create a commercial kitchen equipment manufacturer website.';
    const compiledRequest = await aiKernel.processPrompt(prompt);
    
    assert.ok(compiledRequest);
    const orchestrationResult = compiledRequest.orchestrationResult;
    assert.ok(orchestrationResult, 'Request must contain orchestrationResult');
    assert.strictEqual(orchestrationResult.status, 'SUCCESS');

    const expectedSequence = [
      'requirement-agent',
      'project-intelligence-agent',
      'engineering-decision-agent',
      'architecture-agent',
      'workspace-agent',
      'project-manifest-agent',
      'planner-agent',
      'generator-sdk-agent',
      'executor-agent',
      'reviewer-agent'
    ];

    const actualSequence = orchestrationResult.agentResults.map((r: any) => r.agentId);
    
    assert.strictEqual(actualSequence.length, expectedSequence.length, 'Sequence length must match 10 agents');
    for (let i = 0; i < expectedSequence.length; i++) {
      assert.strictEqual(
        actualSequence[i],
        expectedSequence[i],
        `Agent at index ${i} must be '${expectedSequence[i]}', got '${actualSequence[i]}'`
      );
    }
  });

  it('TEST 3: Downstream agents must receive upstream accumulated outputs', async () => {
    const prompt = 'Create a commercial kitchen equipment manufacturer website.';
    const compiledRequest = await aiKernel.processPrompt(prompt);
    const results = compiledRequest.orchestrationResult.agentResults;

    const reqResult = results.find((r: any) => r.agentId === 'requirement-agent')?.result;
    const intelResult = results.find((r: any) => r.agentId === 'project-intelligence-agent')?.result;
    const decResult = results.find((r: any) => r.agentId === 'engineering-decision-agent')?.result;
    const archResult = results.find((r: any) => r.agentId === 'architecture-agent')?.result;
    const wsResult = results.find((r: any) => r.agentId === 'workspace-agent')?.result;
    const manifestResult = results.find((r: any) => r.agentId === 'project-manifest-agent')?.result;
    const plannerResult = results.find((r: any) => r.agentId === 'planner-agent')?.result;

    assert.ok(reqResult?.requirementObject, 'RequirementAgent output missing requirementObject');
    assert.ok(intelResult?.report, 'ProjectIntelligenceAgent output missing report');
    assert.ok(decResult?.report, 'EngineeringDecisionAgent output missing report');
    assert.ok(archResult?.blueprint, 'ArchitectureAgent output missing blueprint');
    assert.ok(wsResult?.blueprint, 'WorkspaceAgent output missing blueprint');
    assert.ok(manifestResult?.manifest, 'ProjectManifestAgent output missing manifest');
    assert.ok(plannerResult?.plan, 'PlannerAgent output missing plan');
  });

  it('TEST 4: Failure in an upstream agent must stop downstream execution and propagate error', async () => {
    const originalAgent = agentRegistry.get('project-intelligence-agent');
    
    // Temporarily replace agent to simulate failure
    agentRegistry.unregister('project-intelligence-agent');
    agentRegistry.register({
      id: 'project-intelligence-agent',
      definition: originalAgent!.definition,
      status: originalAgent!.status,
      executeTask: async () => {
        throw new Error('Project Intelligence Analysis Failed: Invalid parameters');
      }
    } as any);

    try {
      const prompt = 'Create a commercial kitchen equipment manufacturer website.';
      const compiledRequest = await aiKernel.processPrompt(prompt);
      const orchestrationResult = compiledRequest.orchestrationResult;

      assert.strictEqual(orchestrationResult.status, 'FAILED');
      assert.strictEqual(orchestrationResult.tasksCompleted, 1, 'Only Task 1 (RequirementAgent) should complete');
      assert.strictEqual(orchestrationResult.tasksFailed, 1, 'Task 2 (ProjectIntelligenceAgent) should fail');
      assert.ok(orchestrationResult.errors.some((e: string) => e.includes('Project Intelligence Analysis Failed')));
      assert.strictEqual(orchestrationResult.agentResults.length, 2, 'Execution must stop at Task 2 without running Tasks 3..10');
    } finally {
      // Restore original agent
      agentRegistry.unregister('project-intelligence-agent');
      agentRegistry.register(originalAgent!);
    }
  });

  it('TEST 5: Verify no duplicate agent execution in NEW_PROJECT pipeline', async () => {
    const prompt = 'Create a commercial kitchen equipment manufacturer website.';
    const compiledRequest = await aiKernel.processPrompt(prompt);
    const actualSequence = compiledRequest.orchestrationResult.agentResults.map((r: any) => r.agentId);

    const uniqueAgents = new Set(actualSequence);
    assert.strictEqual(actualSequence.length, uniqueAgents.size, 'No duplicate agent IDs should exist in sequence');
  });

});
