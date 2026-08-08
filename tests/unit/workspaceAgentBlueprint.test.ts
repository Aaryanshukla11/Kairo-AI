import * as assert from 'assert';
import { WorkspaceAgent } from '../../src/core/agents/workspace/workspaceAgent';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { IArchitectureBlueprint } from '../../src/core/agents/architecture/architectureTypes';

describe('Workspace Agent Blueprint Unit Tests', () => {
  let agent: WorkspaceAgent;

  const sampleArchBlueprint: IArchitectureBlueprint = {
    requestId: 'req-ws-test-01',
    sessionId: 'session-ws-test-01',
    selectedArchitecturePattern: 'Component-Driven Single Page Application (SPA)',
    layerDiagram: [
      { name: 'PresentationLayer', responsibility: 'UI Views', allowedDependencies: ['DomainLayer'] }
    ],
    moduleDiagram: [
      { name: 'UIComponentModule', layer: 'PresentationLayer', capabilities: ['rendering'], dependencies: ['SharedUtilModule'] }
    ],
    packageLayout: ['@app/common', '@app/core'],
    folderLayout: { src: { components: {} } },
    dependencyGraph: { nodes: [], edges: [], hasCircularDependencies: false },
    communicationRules: ['Layers communicate cleanly'],
    sharedLibraries: ['@app/common/utils'],
    designPrinciples: ['SOLID'],
    validationStatus: 'PASSED',
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  beforeEach(() => {
    agent = new WorkspaceAgent({
      id: 'workspace-agent',
      name: 'Workspace Agent',
      role: 'Workspace Layout & Boundaries QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['workspace', 'boundaries', 'discovery'],
      permissions: ['READ', 'WRITE']
    });
    agent.clearHistory();
  });

  it('should analyze architecture blueprint and generate validated Workspace Blueprint', async () => {
    const task: AgentTask = {
      id: 'task-ws-001',
      title: 'Generate Workspace Blueprint',
      assignedAgentId: 'workspace-agent',
      payload: {
        architectureBlueprint: sampleArchBlueprint,
        workspacePath: 'c:/my-workspace'
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.blueprint);

    const blueprint = result.blueprint;
    assert.strictEqual(blueprint.requestId, 'req-ws-test-01');
    assert.strictEqual(blueprint.sessionId, 'session-ws-test-01');
    assert.ok(blueprint.workspaceType);
    assert.strictEqual(blueprint.repositoryLayout.rootPath, 'c:/my-workspace');
    assert.ok(blueprint.packageStructure.length > 0);
    assert.ok(blueprint.aiManagedAreas.length > 0);
    assert.ok(blueprint.userManagedAreas.length > 0);
    assert.strictEqual(blueprint.validationStatus, 'PASSED');
  });

  it('should emit structured stage logs for all 8 workspace stages', async () => {
    const task: AgentTask = {
      id: 'task-ws-002',
      title: 'Generate Blueprint',
      assignedAgentId: 'workspace-agent',
      payload: {
        architectureBlueprint: sampleArchBlueprint
      },
      status: 'pending'
    };

    await agent.executeTask(task);

    const logs = agent.getLogs();
    assert.ok(logs.length >= 8);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('WORKSPACE_ANALYSIS_STARTED'));
    assert.ok(stages.includes('EXISTING_WORKSPACE_DETECTION'));
    assert.ok(stages.includes('REPOSITORY_PLANNING'));
    assert.ok(stages.includes('PACKAGE_PLANNING'));
    assert.ok(stages.includes('OWNERSHIP_ASSIGNMENT'));
    assert.ok(stages.includes('WORKSPACE_VALIDATION'));
    assert.ok(stages.includes('WORKSPACE_BLUEPRINT_GENERATED'));
    assert.ok(stages.includes('BLUEPRINT_RETURNED'));
  });

  it('should not generate source code or physically create files or folders on disk', async () => {
    const task: AgentTask = {
      id: 'task-ws-003',
      title: 'Generate Blueprint',
      assignedAgentId: 'workspace-agent',
      payload: {
        architectureBlueprint: sampleArchBlueprint
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);
    const blueprint = result.blueprint;

    assert.ok(blueprint.aiManagedAreas.includes('src/components/'));
    assert.ok(blueprint.userManagedAreas.includes('README.md'));
    assert.ok(!('sourceCode' in (blueprint as any)));
  });
});
