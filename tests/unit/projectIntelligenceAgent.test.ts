import * as assert from 'assert';
import { ProjectIntelligenceAgent } from '../../src/core/agents/projectIntelligence/projectIntelligenceAgent';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { IRequirementObject } from '../../src/core/agents/requirement/requirementTypes';

describe('Project Intelligence Agent Unit Tests', () => {
  let agent: ProjectIntelligenceAgent;

  const sampleReqObject: IRequirementObject = {
    requestId: 'req-pi-test-01',
    sessionId: 'session-pi-test-01',
    userIntent: 'Build Express REST API with MongoDB',
    projectCategory: 'Web/API',
    projectScope: 'Web/API Module',
    features: ['Item Creation', 'User Authentication'],
    constraints: ['Offline Local Execution'],
    preferredStack: {
      language: 'TypeScript',
      frontend: null,
      backend: 'Express',
      database: 'MongoDB',
      buildTool: 'Vite'
    },
    priority: 'HIGH',
    estimatedComplexity: 'MEDIUM',
    expectedDeliverables: ['Source Code', 'Documentation'],
    metadata: {
      timestamp: Date.now(),
      version: '1.0.0',
      rawPromptLength: 45
    },
    validationStatus: 'PASSED'
  };

  beforeEach(() => {
    agent = new ProjectIntelligenceAgent({
      id: 'project-intelligence-agent',
      name: 'Project Intelligence Agent',
      role: 'Project Classification & Tech Stack Intelligence QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 10,
      capabilities: ['intelligence', 'classification', 'stack_recommendation'],
      permissions: ['READ']
    });
    agent.clearHistory();
  });

  it('should analyze requirement object and generate structured Project Intelligence Report', async () => {
    const task: AgentTask = {
      id: 'task-pi-001',
      title: 'Analyze Project Intelligence',
      assignedAgentId: 'project-intelligence-agent',
      payload: {
        requirementObject: sampleReqObject
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.report);

    const report = result.report;
    assert.strictEqual(report.requestId, 'req-pi-test-01');
    assert.strictEqual(report.sessionId, 'session-pi-test-01');
    assert.ok(report.projectType);
    assert.ok(report.suggestedArchitecture);
    assert.strictEqual(report.suggestedTechStack.language, 'TypeScript');
    assert.strictEqual(report.suggestedTechStack.backend, 'Express');
    assert.ok(report.requiredModules.includes('AuthModule'));
    assert.ok(report.dependencyList.includes('express'));
    assert.ok(report.recommendedExecutionStrategy);
  });

  it('should emit structured stage logs for all project intelligence stages', async () => {
    const task: AgentTask = {
      id: 'task-pi-002',
      title: 'Analyze Project Intelligence',
      assignedAgentId: 'project-intelligence-agent',
      payload: {
        rawPrompt: 'Create React and Vite SPA',
        requirementObject: sampleReqObject
      },
      status: 'pending'
    };

    await agent.executeTask(task);

    const logs = agent.getLogs();
    assert.ok(logs.length >= 6);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('INTELLIGENCE_ANALYSIS_STARTED'));
    assert.ok(stages.includes('PROJECT_CLASSIFICATION'));
    assert.ok(stages.includes('STACK_RECOMMENDATION'));
    assert.ok(stages.includes('DEPENDENCY_ANALYSIS'));
    assert.ok(stages.includes('INTELLIGENCE_REPORT_CREATED'));
    assert.ok(stages.includes('REPORT_RETURNED'));
  });

  it('should not generate source code or perform direct model calls', async () => {
    const task: AgentTask = {
      id: 'task-pi-003',
      title: 'Analyze CLI App',
      assignedAgentId: 'project-intelligence-agent',
      payload: {
        requirementObject: sampleReqObject
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);
    const report = result.report;

    assert.ok(Array.isArray(report.dependencyList));
    assert.ok(Array.isArray(report.riskAssessment));
    assert.ok(!('sourceCode' in (report as any)));
  });
});
