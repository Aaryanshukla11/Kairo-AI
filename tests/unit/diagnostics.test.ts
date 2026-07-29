import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { DiagnosticsEngine } from '../../src/core/diagnostics/diagnosticsEngine';
import { DiagnosticSeverity, DiagnosticCategory, DiagnosticStatus } from '../../src/core/diagnostics/diagnosticsTypes';

describe('Diagnostics Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-diagnostics-workspace');
  let engine: DiagnosticsEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new DiagnosticsEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Diagnostics Lifecycle', () => {
    it('should create, validate, filter, and export diagnostics', () => {
      const diag = engine.report(
        'PlannerModule',
        DiagnosticSeverity.Error,
        DiagnosticCategory.Planner,
        'Plan generation failed',
        'Could not identify terminal boundaries',
        'Error at plan:12'
      );

      assert.strictEqual(diag.status, DiagnosticStatus.Open);
      assert.strictEqual(diag.sourceModule, 'PlannerModule');
      assert.strictEqual(diag.severity, DiagnosticSeverity.Error);

      const logFile = path.resolve(tempWorkspace, '.aiidle', 'logs', 'diagnostics.log');
      assert.ok(fs.existsSync(logFile));
      assert.ok(fs.readFileSync(logFile, 'utf8').includes('Plan generation failed'));

      engine.updateStatus(diag.id, DiagnosticStatus.Resolved);
      assert.strictEqual(diag.status, DiagnosticStatus.Resolved);

      const filtered = engine.getFilteredHistory({
        severity: DiagnosticSeverity.Error,
        category: DiagnosticCategory.Planner
      });
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].id, diag.id);

      const json = engine.exportJson();
      assert.ok(json.includes('"sourceModule": "PlannerModule"'));
    });

    it('should throw validation errors when sourceModule or message is missing', () => {
      assert.throws(() => {
        engine.report('', DiagnosticSeverity.Info, DiagnosticCategory.System, 'System started');
      }, /Source module is required/);

      assert.throws(() => {
        engine.report('SystemModule', DiagnosticSeverity.Info, DiagnosticCategory.System, '');
      }, /Message content is required/);
    });
  });
});
