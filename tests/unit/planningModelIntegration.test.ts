import * as assert from 'assert';
import { planningModelIntegration } from '../../src/core/planning-model-integration';
import { IPlanningSession } from '../../src/core/planning-session-builder/types';
import { IPlanningModelProvider } from '../../src/core/planning-model-integration/types';

describe('Sprint 2 - Planning Model Integration Module Tests', () => {

  const mockSession: IPlanningSession = {
    sessionId: 'session-t1',
    timestamp: 123456,
    systemInstructions: 'System role guidelines',
    injectedRules: ['Rule 1'],
    context: {
      project: { name: 'CMS', type: 'Dashboard' },
      workspace: { isEmpty: true, isProjectPresent: false, isMonorepo: false, hasGit: false },
      stack: {
        language: 'TypeScript', frontend: 'React', backend: null, database: null,
        authMethod: null, apiStyle: null, uiFramework: null, cssFramework: null,
        stateManagement: null, buildTool: null
      }
    },
    outputSchemaSpecification: 'Schema string',
    userPromptPayload: 'Build auth screens',
    metadata: { estimatedTokenCount: 150, formatType: 'JSON_SCHEMA' }
  };

  const mockValidContractJson = JSON.stringify({
    contractVersion: '1.0.0',
    requestId: 'session-t1',
    projectInfo: {
      name: 'CMS',
      type: 'Dashboard',
      description: 'Test project',
      targetPlatform: 'Web',
      language: 'TypeScript',
      frontendFramework: 'React',
      backendFramework: null,
      database: null,
      authentication: null,
      deploymentTarget: null
    },
    detectedFeatures: [],
    projectArchitecture: 'Monolith',
    executionPhases: [],
    taskGraph: [
      {
        taskId: 't1',
        taskName: 'Scaffold project',
        taskType: 'CREATE_STRUCTURE',
        description: 'Create folders',
        priority: 'CRITICAL',
        dependencies: [],
        input: 'Workspace',
        expectedOutput: 'Created directories',
        owner: 'Scaffolder',
        executionOrder: 1
      }
    ],
    warnings: [],
    errors: [],
    metadata: {
      generatedAt: Date.now(),
      planningDurationMs: 120
    }
  });

  it('should execute session pipeline successfully with a valid provider', async () => {
    const successProvider: IPlanningModelProvider = {
      providerId: 'mock-deepseek-planning',
      execute: async () => mockValidContractJson
    };

    const contract = await planningModelIntegration.executeSession(mockSession, successProvider);
    assert.strictEqual(contract.contractVersion, '1.0.0');
    assert.strictEqual(contract.projectInfo.name, 'CMS');
    assert.strictEqual(contract.taskGraph[0].taskId, 't1');

    const logs = planningModelIntegration.getExecutionLogs();
    assert.ok(logs.some(l => l.requestId === 'session-t1' && l.status === 'SUCCESS'));
  });

  it('should retry execution if provider fails intermittently and then succeeds', async () => {
    let callCount = 0;
    const flakeyProvider: IPlanningModelProvider = {
      providerId: 'mock-flakey-planner',
      execute: async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Timeout connecting to API server');
        }
        return mockValidContractJson;
      }
    };

    const contract = await planningModelIntegration.executeSession(mockSession, flakeyProvider, {
      maxRetries: 3,
      timeoutMs: 1000
    });

    assert.strictEqual(contract.projectInfo.name, 'CMS');
    assert.strictEqual(callCount, 3); // 2 failures + 1 success

    const logs = planningModelIntegration.getExecutionLogs();
    const activeLog = logs[logs.length - 1];
    assert.strictEqual(activeLog.retryCount, 2);
    assert.strictEqual(activeLog.status, 'SUCCESS');
  });

  it('should fail and log errors if provider keeps throwing model errors', async () => {
    const brokenProvider: IPlanningModelProvider = {
      providerId: 'mock-broken-planner',
      execute: async () => {
        throw new Error('API Key Limit Exceeded');
      }
    };

    await assert.rejects(async () => {
      await planningModelIntegration.executeSession(mockSession, brokenProvider, {
        maxRetries: 2,
        timeoutMs: 1000
      });
    }, /API Key Limit Exceeded/);

    const logs = planningModelIntegration.getExecutionLogs();
    const activeLog = logs[logs.length - 1];
    assert.strictEqual(activeLog.status, 'FAILED');
    assert.ok(activeLog.errors.some(e => e.includes('API Key Limit Exceeded')));
  });

  it('should fail and log errors if model output is invalid JSON format', async () => {
    const invalidJsonProvider: IPlanningModelProvider = {
      providerId: 'mock-bad-json-planner',
      execute: async () => '{ bad: json }'
    };

    await assert.rejects(async () => {
      await planningModelIntegration.executeSession(mockSession, invalidJsonProvider);
    }, /is not valid JSON/);

    const logs = planningModelIntegration.getExecutionLogs();
    const activeLog = logs[logs.length - 1];
    assert.strictEqual(activeLog.status, 'FAILED');
  });

});
