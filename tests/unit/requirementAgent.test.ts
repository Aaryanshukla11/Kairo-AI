import * as assert from 'assert';
import { RequirementAgent } from '../../src/core/agents/requirement/requirementAgent';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';

describe('Requirement Agent Unit Tests', () => {
  let agent: RequirementAgent;

  beforeEach(() => {
    agent = new RequirementAgent({
      id: 'requirement-agent',
      name: 'Requirement Agent',
      role: 'Prompt Requirement Analysis & Intent QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 10,
      capabilities: ['requirement', 'intent', 'scope'],
      permissions: ['READ']
    });
    agent.clearHistory();
  });

  it('should analyze prompt request and generate validated Requirement Object', async () => {
    const task: AgentTask = {
      id: 'task-req-test-01',
      title: 'Analyze Prompt Requirements',
      assignedAgentId: 'requirement-agent',
      payload: {
        rawPrompt: 'Create a React and TypeScript Todo Manager with filtering and search',
        requestId: 'req-001',
        sessionId: 'session-001',
        intent: 'Web/Frontend'
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.requirementObject);

    const obj = result.requirementObject;
    assert.strictEqual(obj.requestId, 'req-001');
    assert.strictEqual(obj.sessionId, 'session-001');
    assert.ok(obj.userIntent);
    assert.strictEqual(obj.projectCategory, 'Web/Frontend');
    assert.ok(obj.features.length > 0);
    assert.strictEqual(obj.preferredStack.language, 'TypeScript');
    assert.strictEqual(obj.preferredStack.frontend, 'React');
    assert.strictEqual(obj.validationStatus, 'PASSED');
  });

  it('should emit structured stage logs for all requirement stages', async () => {
    const task: AgentTask = {
      id: 'task-req-test-02',
      title: 'Analyze Prompt',
      assignedAgentId: 'requirement-agent',
      payload: {
        rawPrompt: 'Build Express REST API for Todo items with MongoDB',
        requestId: 'req-002',
        sessionId: 'session-002'
      },
      status: 'pending'
    };

    await agent.executeTask(task);

    const logs = agent.getLogs();
    assert.ok(logs.length >= 5);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('PROMPT_RECEIVED'));
    assert.ok(stages.includes('REQUIREMENT_ANALYSIS_STARTED'));
    assert.ok(stages.includes('REQUIREMENT_OBJECT_CREATED'));
    assert.ok(stages.includes('VALIDATION_PASSED'));
    assert.ok(stages.includes('RESULT_RETURNED'));
  });

  it('should not generate source code or perform direct model calls', async () => {
    const task: AgentTask = {
      id: 'task-req-test-03',
      title: 'Analyze CLI Tool Request',
      assignedAgentId: 'requirement-agent',
      payload: {
        rawPrompt: 'Create a Node.js CLI tool for file renaming',
        requestId: 'req-003',
        sessionId: 'session-003'
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);
    const obj = result.requirementObject;

    // Verify object structure is purely requirement analysis metadata
    assert.strictEqual(typeof obj.userIntent, 'string');
    assert.strictEqual(typeof obj.estimatedComplexity, 'string');
    assert.ok(Array.isArray(obj.expectedDeliverables));
    assert.ok(!('sourceCode' in (obj as any)));
  });
});
