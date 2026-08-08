import * as assert from 'assert';
import { planningSessionBuilder } from '../../src/core/planning-session-builder';
import { IAIRequestOutput } from '../../src/core/ai-request-builder/types';

describe('Sprint 2 - Planning Session Builder Module Tests', () => {

  const mockRequest: IAIRequestOutput = {
    requestId: 'test-req-id-111',
    timestamp: 1234567890,
    prompt: 'Build a nextjs app with postgres database and Stripe payments.',
    intent: 'NEW_PROJECT',
    project: {
      name: 'KairoShop',
      type: 'Ecommerce'
    },
    workspace: {
      isEmpty: true,
      isProjectPresent: false,
      isMonorepo: false,
      hasGit: false
    },
    stack: {
      language: 'TypeScript',
      frontend: 'Next.js',
      backend: null,
      database: 'PostgreSQL',
      authMethod: 'JWT',
      apiStyle: 'REST',
      uiFramework: null,
      cssFramework: 'Tailwind CSS',
      stateManagement: null,
      buildTool: null
    },
    requirements: [
      { name: 'TypeScript', category: 'technology', priority: 'CRITICAL' },
      { name: 'Next.js', category: 'technology', priority: 'CRITICAL' }
    ],
    metadata: {
      length: 62,
      lineCount: 1,
      hasMarkdown: false
    },
    warnings: ['No backend framework specified.']
  };

  it('should compile request into planning session with role instructions and rules', () => {
    const result = planningSessionBuilder.buildSession(mockRequest);

    // Verify properties mapped
    assert.strictEqual(result.userPromptPayload, mockRequest.prompt);
    assert.strictEqual(result.context.project.name, 'KairoShop');
    assert.strictEqual(result.context.stack.frontend, 'Next.js');

    // Verify system instructions contains constraints
    assert.ok(result.systemInstructions.includes('Role: Senior Software Architect'));
    assert.ok(result.systemInstructions.includes('DO NOT write application source code'));

    // Verify injected rules
    assert.ok(result.injectedRules.includes('Never generate source code or code snippets.'));
    assert.ok(result.injectedRules.includes('Always return valid structured JSON.'));

    // Verify output schema
    const schema = JSON.parse(result.outputSchemaSpecification);
    assert.strictEqual(schema.title, 'IPlanningContract');

    // Verify token estimation
    assert.ok(result.metadata.estimatedTokenCount > 0);

    // Verify immutability
    assert.throws(() => {
      (result as any).sessionId = 'HackID';
    }, /Cannot assign to read only property/);
  });

});
