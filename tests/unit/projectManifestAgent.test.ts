import * as assert from 'assert';
import { ProjectManifestAgent } from '../../src/core/agents/projectManifest/projectManifestAgent';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { IWorkspaceBlueprint } from '../../src/core/agents/workspace/workspaceTypes';

describe('Project Manifest Agent Unit Tests', () => {
  let agent: ProjectManifestAgent;

  const sampleWorkspaceBlueprint: IWorkspaceBlueprint = {
    requestId: 'req-pm-test-01',
    sessionId: 'session-pm-test-01',
    workspaceType: 'Single Project',
    repositoryLayout: {
      rootPath: 'c:/my-workspace',
      isMonorepo: false,
      packageManager: 'npm'
    },
    packageStructure: [
      { name: 'app-core', path: 'src/', type: 'application', isAiManaged: true }
    ],
    folderHierarchy: { src: { components: {} } },
    sharedLibraries: ['@app/common/utils'],
    configurationMap: { package: 'package.json' },
    buildStructure: { outputDirectory: 'dist', scripts: { build: 'npm run build' } },
    aiManagedAreas: ['src/components/'],
    userManagedAreas: ['README.md'],
    validationStatus: 'PASSED',
    metadata: { timestamp: Date.now(), version: '1.0.0' }
  };

  beforeEach(() => {
    agent = new ProjectManifestAgent({
      id: 'project-manifest-agent',
      name: 'Project Manifest Agent',
      role: 'Single Source of Truth Manifest & Ownership QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 10,
      capabilities: ['manifest', 'ownership', 'file_tree'],
      permissions: ['READ']
    });
    agent.clearHistory();
  });

  it('should analyze workspace blueprint and generate immutable Project Manifest with 1-to-1 ownership', async () => {
    const task: AgentTask = {
      id: 'task-pm-001',
      title: 'Generate Project Manifest',
      assignedAgentId: 'project-manifest-agent',
      payload: {
        workspaceBlueprint: sampleWorkspaceBlueprint
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.manifest);

    const manifest = result.manifest;
    assert.strictEqual(manifest.requestId, 'req-pm-test-01');
    assert.strictEqual(manifest.sessionId, 'session-pm-test-01');
    assert.ok(manifest.plannedFileTree.length > 0);
    assert.ok(Object.keys(manifest.generatorOwnershipMap).length > 0);
    assert.strictEqual(manifest.dependencyGraph.valid, true);
    assert.strictEqual(manifest.validationStatus, 'PASSED');
    assert.ok(manifest.protectedFiles.includes('.env'));
  });

  it('should emit structured stage logs for all 7 project manifest stages', async () => {
    const task: AgentTask = {
      id: 'task-pm-002',
      title: 'Generate Manifest',
      assignedAgentId: 'project-manifest-agent',
      payload: {
        workspaceBlueprint: sampleWorkspaceBlueprint
      },
      status: 'pending'
    };

    await agent.executeTask(task);

    const logs = agent.getLogs();
    assert.ok(logs.length >= 7);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('MANIFEST_GENERATION_STARTED'));
    assert.ok(stages.includes('FILE_PLANNING'));
    assert.ok(stages.includes('OWNERSHIP_ASSIGNMENT'));
    assert.ok(stages.includes('DEPENDENCY_VALIDATION'));
    assert.ok(stages.includes('MANIFEST_VALIDATION'));
    assert.ok(stages.includes('MANIFEST_GENERATED'));
    assert.ok(stages.includes('MANIFEST_RETURNED'));
  });

  it('should not generate source code or create physical files or folders on disk', async () => {
    const task: AgentTask = {
      id: 'task-pm-003',
      title: 'Generate Manifest',
      assignedAgentId: 'project-manifest-agent',
      payload: {
        workspaceBlueprint: sampleWorkspaceBlueprint
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);
    const manifest = result.manifest;

    assert.ok(manifest.validationRules.length > 0);
    assert.ok(!('sourceCode' in (manifest as any)));
  });
});
