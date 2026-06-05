import * as assert from 'assert';
import { enterpriseRequirementBuilder } from '../../src/core/code-generation/requirement-schema/builders';
import { projectIntelligenceEngine } from '../../src/core/code-generation/project-intelligence';
import { engineeringDecisionEngine } from '../../src/core/code-generation/engineering-decision';
import { architectureGeneratorEngine } from '../../src/core/code-generation/architecture-generator';
import { workspaceScaffolderEngine } from '../../src/core/code-generation/workspace-scaffolder';

describe('Phase 9 - Workspace Blueprint & Scaffolding Engine Tests', () => {

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

  it('should generate a validated Workspace Blueprint with a scaffolding sequence plan', () => {
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

    // Verify Repository Layout type selection
    assert.strictEqual(workspace.workspaceType, 'MultiPackage');

    // Verify Designed packages layout
    assert.ok(workspace.packages.some(p => p.name === 'frontend-app'));
    assert.ok(workspace.packages.some(p => p.name === 'backend-server'));
    assert.ok(workspace.packages.some(p => p.name === 'common-types'));

    // Verify Folder Ownership Map
    assert.strictEqual(workspace.ownershipMap['packages/types'], 'TypesGenerator');
    assert.strictEqual(workspace.ownershipMap['apps/frontend'], 'FrontendGenerator');

    // Verify Dependency Rules
    assert.ok(workspace.dependencyRules.length > 0);

    // Verify Build Strategy details
    assert.ok(workspace.buildStrategy.includes('Vite'));

    // Verify configuration authoritative locations
    assert.strictEqual(workspace.configurationLocations.tsconfig, 'tsconfig.json (workspace level root)');

    // Verify Scaffolding Plan steps execution sequencing - Library packages compile first
    assert.ok(workspace.scaffoldingPlan.steps.length > 0);
    const typesStep = workspace.scaffoldingPlan.steps.find(s => s.name.includes('types'));
    const feStep = workspace.scaffoldingPlan.steps.find(s => s.name.includes('frontend'));
    assert.ok(typesStep!.executionPriority < feStep!.executionPriority);

    // Verify validation checks
    assert.strictEqual(workspace.validationReport.isValid, true);
    assert.strictEqual(workspace.validationReport.violations.length, 0);

    // Verify freezing immutability
    assert.throws(() => {
      (workspace as any).workspaceType = 'hack';
    }, /Cannot assign to read only property/);
  });

});
