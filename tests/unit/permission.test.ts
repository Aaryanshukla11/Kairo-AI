import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { PermissionEngine } from '../../src/core/permission/permissionEngine';
import { PermissionAction, PermissionRiskLevel, PermissionStatus, PermissionPolicy } from '../../src/core/permission/permissionTypes';

describe('Permission Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-permission-workspace');
  let engine: PermissionEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new PermissionEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Permission Lifecycle', () => {
    it('should create, validate, grant, and persist policies', () => {
      const { request, response } = engine.requestPermission(
        PermissionAction.WriteFile,
        'src/main.ts',
        PermissionRiskLevel.High,
        'Modifying entrypoint code',
        'PatchEngine'
      );

      assert.ok(request);
      assert.strictEqual(response, undefined);
      assert.strictEqual(request.status, PermissionStatus.Pending);

      const auditLog = path.resolve(tempWorkspace, '.aiidle', 'logs', 'permission-audit.log');
      assert.ok(fs.existsSync(auditLog));
      assert.ok(fs.readFileSync(auditLog, 'utf8').includes('src/main.ts'));

      const res = engine.grantPermission(request.id, true, PermissionPolicy.AlwaysAllow);
      assert.strictEqual(res.approved, true);
      assert.strictEqual(res.status, PermissionStatus.Approved);

      const next = engine.requestPermission(
        PermissionAction.WriteFile,
        'src/main.ts',
        PermissionRiskLevel.High,
        'Another write',
        'PatchEngine'
      );
      assert.strictEqual(next.request, undefined);
      assert.ok(next.response);
      assert.strictEqual(next.response.approved, true);
      assert.strictEqual(next.response.policyApplied, PermissionPolicy.AlwaysAllow);
    });

    it('should throw validation error on empty resources', () => {
      assert.throws(() => {
        engine.requestPermission(PermissionAction.ReadFile, '', PermissionRiskLevel.Low, 'Read log', 'Filesystem');
      }, /Requested resource cannot be empty/);
    });
  });
});
