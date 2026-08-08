import * as assert from 'assert';
import { codeGenerationPipeline } from '../../src/core/code-generation/pipeline-coordinator';

describe('Phase 9 - End-to-End Pipeline Coordinator Integration Tests', () => {

  it('should run a raw natural language prompt through all 7 engines and output a validated manifest', () => {
    const prompt = 'Build a Hospital Management app using React, FastAPI, PostgreSQL, and JWT authentication deployment on Docker';

    // Run pipeline coordinator
    const manifest = codeGenerationPipeline.run(prompt);

    // Assertions mapping output validation
    assert.strictEqual(manifest.schemaVersion, '1.0.0');

    // 1. Requirement Stage check
    assert.ok(manifest.projectName.includes('Hospital'));

    // 2. File Ownership mapping check
    const tsFile = manifest.plannedFiles.find(f => f.path === 'tsconfig.json');
    assert.strictEqual(tsFile!.ownerGeneratorId, 'ConfigGenerator');

    // 3. Execution steps ordering check
    const workspaceStep = manifest.executionPlan.steps.find(s => s.generatorId === 'WorkspaceScaffolder');
    const dbStep = manifest.executionPlan.steps.find(s => s.generatorId === 'DatabaseGenerator');
    assert.ok(workspaceStep!.executionPriority < dbStep!.executionPriority);

    // 4. Checkpoints mapping check
    assert.ok(manifest.rollbackStrategy.checkpoints.length > 0);

    // 5. Validation Check pass status check
    assert.strictEqual(manifest.validationReport.isValid, true);
    assert.strictEqual(manifest.validationReport.violations.length, 0);

    // Freeze validation check
    assert.throws(() => {
      (manifest as any).schemaVersion = '1.0.1';
    }, /Cannot assign to read only property/);
  });

});
