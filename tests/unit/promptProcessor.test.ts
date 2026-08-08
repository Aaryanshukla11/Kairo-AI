import * as assert from 'assert';
import { promptProcessor } from '../../src/core/prompt-processor';

describe('Sprint 1 - Prompt Processor Module Tests', () => {

  it('should parse, normalize, and detect NEW_PROJECT intent with metadata', () => {
    const raw = `
      Build a new reactjs app with node backend and postgres database.
      Include Dockerfile configurations.
    `;

    const result = promptProcessor.process(raw);

    // Verify parser normalized newlines and trimmed
    assert.ok(result.normalizedPrompt.includes('React'));
    assert.ok(result.normalizedPrompt.includes('Node.js'));
    assert.ok(result.normalizedPrompt.includes('PostgreSQL'));
    
    // Verify intent detection
    assert.strictEqual(result.intent, 'NEW_PROJECT');
    assert.ok(result.confidence > 0.5);

    // Verify metadata properties
    assert.strictEqual(result.metadata.hasMarkdown, false);
    assert.ok(result.metadata.detectedTech.includes('React'));
    assert.ok(result.metadata.detectedTech.includes('Node.js'));
    assert.ok(result.metadata.detectedTech.includes('PostgreSQL'));
    assert.ok(result.metadata.detectedTech.includes('Docker'));

    // Verify immutability freezing
    assert.throws(() => {
      (result as any).intent = 'DEBUG_PROJECT';
    }, /Cannot assign to read only property/);

    assert.throws(() => {
      (result.metadata as any).hasMarkdown = true;
    }, /Cannot assign to read only property/);
  });

  it('should detect MODIFY_PROJECT intent correctly', () => {
    const prompt = 'Add a new feature to search patient histories in the dashboard module';
    const result = promptProcessor.process(prompt);
    assert.strictEqual(result.intent, 'MODIFY_PROJECT');
  });

  it('should detect DEBUG_PROJECT intent correctly', () => {
    const prompt = 'The application crashed on loading with unhandled rejection error in connection';
    const result = promptProcessor.process(prompt);
    assert.strictEqual(result.intent, 'DEBUG_PROJECT');
  });

  it('should parse markdown blocks correctly without modification', () => {
    const raw = 'How do I optimize this block:\n```js\nconst x = 5;\n```';
    const result = promptProcessor.process(raw);
    assert.strictEqual(result.metadata.hasMarkdown, true);
    assert.ok(result.normalizedPrompt.includes('JavaScript'));
  });

});
