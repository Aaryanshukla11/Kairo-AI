import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { releaseEngine } from '../../src/core/release/releaseEngine';
import { releaseCoordinator } from '../../src/core/release/releaseCoordinator';
import { releaseValidator } from '../../src/core/release/releaseValidator';
import { releaseBuilder } from '../../src/core/release/releaseBuilder';
import { documentationValidator } from '../../src/core/release/documentation/documentationValidator';
import { dogfoodingEngine } from '../../src/core/release/dogfooding/dogfoodingEngine';
import { releaseChecklist } from '../../src/core/release/rcBuilder/releaseChecklist';
import { compatibilityReport } from '../../src/core/release/rcBuilder/compatibilityReport';
import { artifactCollector } from '../../src/core/release/rcBuilder/artifactCollector';

describe('Release Candidate 1 Verification & Dogfooding Tests', () => {
  const workspaceRoot = path.resolve(__dirname, '../../../../');

  describe('Autonomous Release Quality Gates Verification', () => {
    it('should pass all release checklist quality checks criteria', () => {
      const gate = releaseChecklist.evaluateGate();
      assert.strictEqual(gate.architecturePassed, true);
      assert.strictEqual(gate.runtimePassed, true);
      assert.strictEqual(gate.securityPassed, true);
      assert.strictEqual(gate.documentationPassed, true);
      assert.strictEqual(gate.developerExperiencePassed, true);
    });

    it('should calculate proper health summaries grades for all subsystems', () => {
      const health = releaseCoordinator.calculateHealthSummary();
      assert.ok(health.overallScore >= 95);
      assert.ok(health.architectureHealth > 90);
      assert.ok(health.securityHealth === 100);
      assert.ok(health.documentationHealth === 100);
    });
  });

  describe('Documentation Link-Rot & Integrity Validator', () => {
    it('should confirm core installation, API and arch guides exist and contain no invalid workspace link paths', () => {
      const res = documentationValidator.validateDocs(workspaceRoot);
      assert.ok(res.score >= 90);
      assert.strictEqual(res.brokenLinks.length, 0);
      assert.strictEqual(res.missingSections.length, 0);
    });
  });

  describe('Self-Dogfooding Lifecycle Verification', () => {
    it('should complete feature request plan, compile code, patch diff, and apply Safe Edit checks', async () => {
      const dogfood = await dogfoodingEngine.executeDogfooding(
        'Verify context compression bounds triggers configurations',
        workspaceRoot
      );
      assert.ok(dogfood.runId.startsWith('dogfood-run-'));
      assert.strictEqual(dogfood.planningPassed, true);
      assert.strictEqual(dogfood.codeGenerated, true);
      assert.strictEqual(dogfood.patchProduced, true);
      assert.strictEqual(dogfood.safeEditPassed, true);
      assert.ok(fs.existsSync(path.join(workspaceRoot, 'DOGFOODING_REPORT.md')));
    });
  });

  describe('Release Packaging & Compatibility Verification', () => {
    it('should collect correct list of packaged files and verify compatibility matrix generation', async () => {
      const files = artifactCollector.collectPackagedFiles(workspaceRoot);
      assert.ok(files.includes('package.json'));
      assert.ok(files.includes('DEVELOPER_GUIDE.md'));

      const compContent = compatibilityReport.generate(workspaceRoot);
      assert.ok(compContent.includes('Windows'));
      assert.ok(compContent.includes('macOS'));
      assert.ok(compContent.includes('Linux'));
      assert.ok(fs.existsSync(path.join(workspaceRoot, 'RC1_COMPATIBILITY_REPORT.md')));
    });

    it('should successfully execute the full release candidate generator and save notes, manifests, and health reports', async () => {
      const res = await releaseEngine.runReleasePipeline('0.1.0-rc1');
      assert.ok(res.manifest);
      assert.strictEqual(res.manifest.version, '0.1.0-rc1');
      assert.strictEqual(res.manifest.environment, 'production');

      assert.ok(fs.existsSync(path.join(workspaceRoot, 'RC1_RELEASE_NOTES.md')));
      assert.ok(fs.existsSync(path.join(workspaceRoot, 'RC1_MANIFEST.md')));
      assert.ok(fs.existsSync(path.join(workspaceRoot, 'RC1_HEALTH_REPORT.md')));
    });
  });

});
