import * as assert from 'assert';
import { aiRequestBuilder } from '../../src/core/ai-request-builder';
import { IPromptContext } from '../../src/core/prompt-context-builder/types';

describe('Sprint 1 - AI Request Builder Module Tests', () => {

  const mockContext: IPromptContext = {
    id: 'test-prompt-id',
    timestamp: 9999999999,
    rawPrompt: 'Build a nextjs app with postgres database and Stripe payments.',
    normalizedPrompt: 'Build a Next.js app with PostgreSQL database and Stripe payments.',
    intent: 'NEW_PROJECT',
    confidence: 0.98,
    projectInfo: {
      name: 'KairoShop',
      type: 'Ecommerce'
    },
    workspaceInfo: {
      isEmpty: true,
      isProjectPresent: false,
      isMonorepo: false,
      hasGit: false
    },
    detectedTechnologies: {
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
    detectedFeatures: ['Authentication', 'Payments', 'Payments'], // Duplicate feature
    existingFiles: [],
    dependencies: {},
    warnings: ['No backend framework specified.'],
    metadata: {
      length: 62,
      lineCount: 1,
      hasMarkdown: false
    }
  };

  it('should compile context into a standardized frozen request with priority order', () => {
    const result = aiRequestBuilder.buildRequest(mockContext);

    // Verify metadata properties preserved
    assert.strictEqual(result.requestId, 'test-prompt-id');
    assert.strictEqual(result.prompt, mockContext.normalizedPrompt);
    assert.strictEqual(result.project.name, 'KairoShop');

    // Verify priority sorting (CRITICAL should come before others)
    assert.ok(result.requirements.length > 0);
    assert.strictEqual(result.requirements[0].priority, 'CRITICAL');

    // Verify duplicate features deduplicated (e.g. Payments should appear only once)
    const paymentReqs = result.requirements.filter(r => r.name === 'Payments');
    assert.strictEqual(paymentReqs.length, 1);

    // Verify warnings preserved
    assert.ok(result.warnings.includes('No backend framework specified.'));

    // Verify immutability
    assert.throws(() => {
      (result as any).intent = 'MODIFY_PROJECT';
    }, /Cannot assign to read only property/);
  });

});
