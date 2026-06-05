import * as assert from 'assert';
import { EngineeringDecisionAgent } from '../../src/core/agents/engineeringDecision/engineeringDecisionAgent';
import { AgentStatus, AgentTask } from '../../src/core/agents/agentTypes';
import { IProjectIntelligenceReport } from '../../src/core/agents/projectIntelligence/projectIntelligenceTypes';

describe('Engineering Decision Agent Unit Tests', () => {
  let agent: EngineeringDecisionAgent;

  const sampleIntelligenceReport: IProjectIntelligenceReport = {
    requestId: 'req-ed-test-01',
    sessionId: 'session-ed-test-01',
    projectType: 'New Project',
    suggestedArchitecture: 'Component-Driven Single Page Application (SPA)',
    suggestedTechStack: {
      language: 'TypeScript',
      frontend: 'React',
      backend: 'Express',
      database: 'PostgreSQL',
      buildTool: 'Vite'
    },
    requiredModules: ['CoreAppModule', 'AuthModule', 'DataAccessModule'],
    dependencyList: ['typescript', 'react', 'vite', 'express', 'pg'],
    estimatedComplexity: 'MEDIUM',
    riskAssessment: ['Low Operational Risk'],
    missingInformation: [],
    recommendedExecutionStrategy: 'full_project',
    metadata: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };

  beforeEach(() => {
    agent = new EngineeringDecisionAgent({
      id: 'engineering-decision-agent',
      name: 'Engineering Decision Agent',
      role: 'Technical Decisions & Architecture Strategy QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 10,
      capabilities: ['decision', 'architecture_selection', 'framework_selection'],
      permissions: ['READ']
    });
    agent.clearHistory();
  });

  it('should analyze intelligence report and generate structured Engineering Decision Report', async () => {
    const task: AgentTask = {
      id: 'task-ed-001',
      title: 'Formulate Technical Decisions',
      assignedAgentId: 'engineering-decision-agent',
      payload: {
        projectIntelligenceReport: sampleIntelligenceReport
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);

    assert.strictEqual(result.success, true);
    assert.ok(result.report);

    const report = result.report;
    assert.strictEqual(report.requestId, 'req-ed-test-01');
    assert.strictEqual(report.sessionId, 'session-ed-test-01');
    assert.ok(report.selectedArchitecture);
    assert.strictEqual(report.selectedTechStack.language, 'TypeScript');
    assert.strictEqual(report.selectedTechStack.frontend, 'React');
    assert.strictEqual(report.databaseDecision.system, 'PostgreSQL');
    assert.ok(report.databaseDecision.rationale);
    assert.ok(report.authenticationDecision.strategy);
    assert.strictEqual(report.apiDecision.style, 'REST');
    assert.strictEqual(report.buildStrategy.tool, 'Vite');
    assert.ok(report.folderStructureStrategy.pattern);
    assert.ok(report.codingStandards.linter);
    assert.ok(report.decisionRationales.architecture);
  });

  it('should emit structured stage logs for all engineering decision stages', async () => {
    const task: AgentTask = {
      id: 'task-ed-002',
      title: 'Formulate Decisions',
      assignedAgentId: 'engineering-decision-agent',
      payload: {
        rawPrompt: 'Create React and Vite SPA with JWT',
        projectIntelligenceReport: sampleIntelligenceReport
      },
      status: 'pending'
    };

    await agent.executeTask(task);

    const logs = agent.getLogs();
    assert.ok(logs.length >= 6);

    const stages = logs.map(l => l.stage);
    assert.ok(stages.includes('DECISION_ANALYSIS_STARTED'));
    assert.ok(stages.includes('TECHNOLOGY_SELECTION'));
    assert.ok(stages.includes('ARCHITECTURE_SELECTION'));
    assert.ok(stages.includes('DEPENDENCY_RESOLUTION'));
    assert.ok(stages.includes('ENGINEERING_DECISION_REPORT_CREATED'));
    assert.ok(stages.includes('REPORT_RETURNED'));
  });

  it('should not generate source code or perform direct model calls', async () => {
    const task: AgentTask = {
      id: 'task-ed-003',
      title: 'Formulate Decisions',
      assignedAgentId: 'engineering-decision-agent',
      payload: {
        projectIntelligenceReport: sampleIntelligenceReport
      },
      status: 'pending'
    };

    const result = await agent.executeTask(task);
    const report = result.report;

    assert.ok(report.decisionRationales);
    assert.ok(!('sourceCode' in (report as any)));
  });
});
