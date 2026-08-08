import * as assert from 'assert';
import { enterpriseRequirementBuilder } from '../../src/core/code-generation/requirement-schema/builders';
import { projectIntelligenceEngine } from '../../src/core/code-generation/project-intelligence';
import { engineeringDecisionEngine } from '../../src/core/code-generation/engineering-decision';
import { architectureGeneratorEngine } from '../../src/core/code-generation/architecture-generator';

describe('Phase 9 - Software Architecture Generator Tests', () => {

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

  it('should generate a frozen Architecture Blueprint detailing layers and modules', () => {
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
    const blueprint = architectureGeneratorEngine.generateBlueprint(decisions);

    // Verify System Architecture Recommendation
    assert.strictEqual(blueprint.systemArchitecture, 'Clean Architecture');

    // Verify Layers definition
    assert.strictEqual(blueprint.layers.length, 4);
    assert.ok(blueprint.layers.some(l => l.name === 'Presentation Layer'));
    assert.ok(blueprint.layers.some(l => l.name === 'Domain Layer'));

    // Verify Modules layout
    assert.ok(blueprint.modules.some(m => m.name === 'UserManagement'));
    assert.ok(blueprint.modules.some(m => m.name === 'AppointmentsScheduling'));
    assert.ok(blueprint.modules.some(m => m.name === 'BillingLedger'));

    // Verify Dependency Graph
    assert.ok(blueprint.dependencyGraph.nodes.includes('UserManagement'));
    assert.ok(blueprint.dependencyGraph.edges.some(e => e.from === 'AppointmentsScheduling' && e.to === 'UserManagement'));

    // Verify design patterns
    assert.ok(blueprint.designPatterns.includes('Dependency Injection'));
    assert.ok(blueprint.designPatterns.includes('Repository Pattern'));

    // Verify validations passes
    assert.strictEqual(blueprint.validationReport.isValid, true);
    assert.strictEqual(blueprint.validationReport.violations.length, 0);

    // Verify freezing immutability
    assert.throws(() => {
      (blueprint as any).systemArchitecture = 'hack';
    }, /Cannot assign to read only property/);
  });

});
