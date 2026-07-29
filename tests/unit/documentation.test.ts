import * as assert from 'assert';
import { DocumentationAgent } from '../../src/core/agents/documentation/documentationAgent';
import { DocStrategy, DocType } from '../../src/core/agents/documentation/documentationTypes';
import { documentationValidator } from '../../src/core/agents/documentation/documentationValidator';
import { documentationTemplates } from '../../src/core/agents/documentation/documentationTemplates';
import { documentationPlanner } from '../../src/core/agents/documentation/documentationPlanner';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Documentation Agent Tests', () => {
  let agent: DocumentationAgent;

  before(() => {
    agent = new DocumentationAgent({
      id: 'documentation-agent',
      name: 'Documentation Agent',
      role: 'Project Documentation & Technical Writer',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 5,
      capabilities: ['documenting', 'templates'],
      permissions: ['READ', 'WRITE']
    });
  });

  describe('Validation Checks', () => {
    it('should reject workspace validation if folders list is empty', () => {
      assert.throws(() => {
        documentationValidator.validateWorkspace([]);
      }, /Missing project/);
    });

    it('should reject invalid templates configurations', () => {
      assert.throws(() => {
        documentationValidator.validateTemplate('invalid-tmpl');
      }, /Invalid template configuration/);
    });

    it('should reject unknown docTypes', () => {
      assert.throws(() => {
        documentationValidator.validateDocType('UnknownDoc' as any);
      }, /Unknown document type/);
    });

    it('should identify broken link patterns', () => {
      const content = 'Check [Architecture](file:////undefined/docs/arch.md) for details.';
      const warnings = documentationValidator.validateLinks('README.md', content);
      assert.strictEqual(warnings.length, 1);
      assert.ok(warnings[0].includes('Broken reference link detected'));
    });
  });

  describe('Template Compiling & Planning', () => {
    it('should compile standard readme drafts', () => {
      const markdown = documentationTemplates.compile('standard-readme', { title: 'Test Repo' });
      assert.ok(markdown.includes('# Test Repo'));
      assert.ok(markdown.includes('## Overview'));
    });

    it('should plan incremental update if source code changes', () => {
      const plan = documentationPlanner.plan(['src/core/agents/memory/memoryAgent.ts']);
      assert.strictEqual(plan.strategy, DocStrategy.IncrementalUpdate);
      assert.ok(plan.affectedTypes.includes(DocType.APIDocumentation));
      assert.ok(plan.filesToUpdate.includes('docs/ARCHITECTURE.md'));
    });

    it('should plan template-based README update by default', () => {
      const plan = documentationPlanner.plan([]);
      assert.strictEqual(plan.strategy, DocStrategy.TemplateBased);
      assert.ok(plan.affectedTypes.includes(DocType.README));
      assert.ok(plan.filesToUpdate.includes('README.md'));
    });
  });

  describe('Workflows Execution', () => {
    it('should run documentation workflow successfully and return report', async () => {
      // Mock vscode workspaceFolders mapping
      const workspaceBackup = require('vscode').workspace;
      Object.defineProperty(workspaceBackup, 'workspaceFolders', {
        get: () => [{ name: 'SASTA ANTIGRAVITY' }],
        configurable: true
      });

      const task = {
        id: 'task-dispatch-doc-1',
        title: 'Generate docs',
        assignedAgentId: 'documentation-agent',
        payload: {
          action: 'GENERATE_DOCS',
          gitChanges: ['src/core/agents/reviewer/reviewerAgent.ts']
        },
        status: 'pending' as any
      };

      const res = await agent.executeTask(task);
      assert.strictEqual(res.success, true);
      assert.ok(res.result.report.coverage > 0);
      assert.ok(res.result.report.generatedDocuments.length > 0);
      assert.strictEqual(res.metrics.generationCount, res.result.report.generatedDocuments.length);
    });
  });
});
