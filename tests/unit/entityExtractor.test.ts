import * as assert from 'assert';
import { entityExtractor } from '../../src/core/entity-extractor';

describe('Sprint 1 - Entity Extractor Module Tests', () => {

  it('should extract type, frontend, backend, database and features correctly', () => {
    const prompt = `
      Build a new Hospital Management application named KairoHealth.
      It should use React frontend, Node.js backend, and a PostgreSQL database.
      Include Stripe payments integration, a visual Calendar scheduling feature,
      and an AI Chatbot helper.
    `;

    const result = entityExtractor.extract(prompt);

    // Verify Project Name & Type
    assert.strictEqual(result.projectName.value, 'KairoHealth');
    assert.strictEqual(result.projectName.confidence, 0.9);
    assert.strictEqual(result.projectType.value, 'Hospital Management');
    assert.strictEqual(result.projectType.confidence, 0.95);

    // Verify Frameworks
    assert.strictEqual(result.frontend.value, 'React');
    assert.strictEqual(result.backend.value, 'Node.js');
    assert.strictEqual(result.database.value, 'PostgreSQL');

    // Verify Features
    assert.ok(result.features.includes('Payments'));
    assert.ok(result.features.includes('Calendar'));
    assert.ok(result.aiFeatures.includes('Chatbot'));
    assert.ok(result.integrations.includes('Stripe'));

    // Verify Immutability
    assert.throws(() => {
      (result as any).confidence = 0.99;
    }, /Cannot assign to read only property/);

    assert.throws(() => {
      (result.projectName as any).value = 'HackName';
    }, /Cannot assign to read only property/);
  });

  it('should fallback gracefully to UNKNOWN for missing entities', () => {
    const prompt = 'Hello world how do I deploy this app';
    const result = entityExtractor.extract(prompt);

    assert.strictEqual(result.projectType.value, 'UNKNOWN');
    assert.strictEqual(result.projectType.confidence, 0.0);
    assert.strictEqual(result.frontend.value, null);
    assert.strictEqual(result.frontend.confidence, 0.0);
    assert.strictEqual(result.database.value, null);
    assert.strictEqual(result.database.confidence, 0.0);
  });

});
