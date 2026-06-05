import * as assert from 'assert';
import { generatorSessionBuilder } from '../../src/core/generator-session-builder';
import { IDevelopmentRequest } from '../../src/core/planning-validator-handoff/types';

describe('Chunk 6 - Token Budget & Failure-Safe Model Execution Tests', () => {

  const baseRequest: IDevelopmentRequest = {
    requestId: 'req-memory-001',
    projectInfo: {
      name: 'PortfolioApp',
      type: 'Web',
      description: 'Make the hero section darker.',
      targetPlatform: 'Web',
      language: 'TypeScript',
      frontendFramework: 'React',
      backendFramework: null,
      database: null,
      authentication: null,
      deploymentTarget: null
    },
    technologyStack: {
      language: 'TypeScript',
      frontend: 'React',
      backend: null,
      database: null
    },
    executionPhases: [],
    validatedTaskGraph: [],
    dependencies: [],
    warnings: [],
    metadata: {
      generatedAt: Date.now(),
      validatedAt: Date.now(),
      schemaVersion: '1.0.0'
    }
  };

  it('should serialize conversationHistory into systemRole', () => {
    const requestWithHistory: IDevelopmentRequest = {
      ...baseRequest,
      metadata: {
        ...baseRequest.metadata,
        conversationHistory: [
          { role: 'user', text: 'Create a portfolio website.' },
          { role: 'assistant', text: 'Created index.html and styles.css.' }
        ] as any
      }
    };

    const session = generatorSessionBuilder.buildSession(requestWithHistory);
    assert.ok(session.systemRole.includes('RECENT CONVERSATION HISTORY'));
    assert.ok(session.systemRole.includes('User: Create a portfolio website.'));
    assert.ok(session.systemRole.includes('Assistant: Created index.html and styles.css.'));
  });

  it('should serialize relevant sourceCodeContext into systemRole', () => {
    const requestWithSources: IDevelopmentRequest = {
      ...baseRequest,
      metadata: {
        ...baseRequest.metadata,
        sourceCodeContext: [
          { filePath: 'index.html', content: '<div class="hero">Welcome</div>' }
        ] as any
      }
    };

    const session = generatorSessionBuilder.buildSession(requestWithSources);
    assert.ok(session.systemRole.includes('RELEVANT EXISTING SOURCE FILES'));
    assert.ok(session.systemRole.includes('File: index.html'));
    assert.ok(session.systemRole.includes('<div class="hero">Welcome</div>'));
  });

  it('should bound context when conversation history is excessively large', () => {
    const largeHistory = Array.from({ length: 50 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      text: `Turn ${i} ` + 'x'.repeat(2000)
    }));

    const requestWithLargeHistory: IDevelopmentRequest = {
      ...baseRequest,
      metadata: {
        ...baseRequest.metadata,
        conversationHistory: largeHistory as any
      }
    };

    const session = generatorSessionBuilder.buildSession(requestWithLargeHistory);
    assert.ok(session.metadata.estimatedTokenCount <= 12500, `Token count ${session.metadata.estimatedTokenCount} exceeded budget limit!`);
  });

  it('should construct session properly when conversationHistory is empty', () => {
    const session = generatorSessionBuilder.buildSession(baseRequest);
    assert.strictEqual(session.requestPayload.requestId, 'req-memory-001');
    assert.ok(!session.systemRole.includes('RECENT CONVERSATION HISTORY'));
  });
});
