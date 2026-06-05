import * as assert from 'assert';
import { enterpriseRequirementBuilder } from '../../src/core/code-generation/requirement-schema/builders';
import { projectIntelligenceEngine } from '../../src/core/code-generation/project-intelligence';
import { engineeringDecisionEngine } from '../../src/core/code-generation/engineering-decision';
import { architectureGeneratorEngine } from '../../src/core/code-generation/architecture-generator';
import { workspaceScaffolderEngine } from '../../src/core/code-generation/workspace-scaffolder';
import { projectManifestEngine } from '../../src/core/code-generation/project-manifest';

describe('Phase 9 - Project Manifest & Scaffolding Generation Plan Tests', () => {

  const dummyIdentity = {
    projectName: 'Hospital App',
    projectType: 'Hospital Management',
    domain: 'Healthcare',
    targetPlatform: 'web'
  };

  const dummyBusiness = {
    targetUsers: ['Doctors', 'Patients'],
    businessGoal: 'Scheduling efficiency',
    deadlines: '2026-09-01'
  };

  const dummyStack = {
    frontend: 'React',
    backend: 'FastAPI',
    database: 'PostgreSQL',
    authentication: 'JWT',
    authorization: 'rbac',
    deployment: 'Docker',
    testing: 'pytest',
    documentation: 'swagger'
  };

  const dummyQuality = {
    performance: ['Load time < 1s'],
    security: ['Enforced SSL'],
    accessibility: ['WCAG AA compliance']
  };

  const dummyExtensions = {
    customInstructions: [],
    generatorPreferences: {},
    futureExtensions: {}
  };

  it('should generate a frozen Project Manifest detailing planned files and checkpoints', () => {
    // 1. Build requirement contract
    const req = enterpriseRequirementBuilder.build(
      dummyIdentity,
      dummyBusiness,
      dummyStack,
      dummyQuality,
      dummyExtensions,
      'Build Hospital App',
      'Build Hospital App'
    );

    // 2. Build project intelligence
    const intel = projectIntelligenceEngine.analyze(req);

    // 3. Decide tech stack choices
    const decisions = engineeringDecisionEngine.decide(req, intel);

    // 4. Generate Architecture Blueprint
    const arch = architectureGeneratorEngine.generateBlueprint(decisions);

    // 5. Scaffold Workspace Blueprint
    const workspace = workspaceScaffolderEngine.generateBlueprint(arch);

    // 6. Generate Project Manifest
    const manifest = projectManifestEngine.generateManifest(workspace);

    // Verify metadata
    assert.strictEqual(manifest.schemaVersion, '1.0.0');

    // Verify planned files
    assert.ok(manifest.plannedFiles.length > 0);
    assert.ok(manifest.plannedFiles.some(f => f.path === 'tsconfig.json'));
    assert.ok(manifest.plannedFiles.some(f => f.path.endsWith('App.tsx')));

    // Verify generator assignment ownership
    const envFile = manifest.plannedFiles.find(f => f.path === '.env');
    assert.strictEqual(envFile!.ownerGeneratorId, 'ConfigGenerator');
    assert.strictEqual(envFile!.fileModality, 'PROTECTED');

    // Verify execution plan prioritization stages
    const workspaceStep = manifest.executionPlan.steps.find(s => s.generatorId === 'WorkspaceScaffolder');
    const feStep = manifest.executionPlan.steps.find(s => s.generatorId === 'FrontendGenerator');
    assert.ok(workspaceStep!.executionPriority < feStep!.executionPriority);

    // Verify rollback strategy checkpoints recovery actions
    assert.ok(manifest.rollbackStrategy.checkpoints.length > 0);
    const dbCheckpoint = manifest.rollbackStrategy.checkpoints.find(c => c.stageName.includes('Database'));
    assert.ok(dbCheckpoint!.recoveryActions.some(a => a.includes('Remove generated files')));

    // Verify validation
    assert.strictEqual(manifest.validationReport.isValid, true);
    assert.strictEqual(manifest.validationReport.violations.length, 0);

    // Verify freezing immutability
    assert.throws(() => {
      (manifest as any).projectName = 'hack';
    }, /Cannot assign to read only property/);
  });

});
