import * as assert from 'assert';
import { enterpriseRequirementBuilder } from '../../src/core/code-generation/requirement-schema/builders';
import { projectIntelligenceEngine } from '../../src/core/code-generation/project-intelligence';
import { engineeringDecisionEngine } from '../../src/core/code-generation/engineering-decision';
import { technologyScoringEngine } from '../../src/core/code-generation/engineering-decision/scoring';

describe('Phase 9 - Engineering Decision Engine Tests', () => {

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

  it('should process project intelligence and output frozen engineering decisions contract', () => {
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

    // Verify profile selector - Hospital category resolves to Healthcare profile & Clean Architecture pattern
    assert.strictEqual(decisions.profile.profileType, 'Healthcare');
    assert.strictEqual(decisions.profile.architecturePattern, 'Clean Architecture');
    assert.ok(decisions.profile.securityStrategy.includes('Audit Logs'));

    // Verify recommendations
    assert.strictEqual(decisions.frontend.primary, 'React');
    assert.strictEqual(decisions.database.primary, 'PostgreSQL');
    assert.strictEqual(decisions.database.enterprise, 'PostgreSQL');
    assert.strictEqual(decisions.database.experimental, 'SurrealDB');

    // Verify rationales
    assert.ok(decisions.database.rationale[0].includes('integrity'));

    // Verify configuration mappings for code generators
    assert.strictEqual(decisions.generatorConfigs.frontendConfig.styling, 'TailwindCSS');
    assert.strictEqual(decisions.generatorConfigs.backendConfig.framework, 'FastAPI');
    assert.strictEqual(decisions.generatorConfigs.dbConfig.system, 'PostgreSQL');

    // Verify compatibility
    assert.strictEqual(decisions.compatibilityReport.compatible, true);
    assert.strictEqual(decisions.compatibilityReport.conflicts.length, 0);

    // Verify freezing immutability
    assert.throws(() => {
      (decisions as any).profile = {};
    }, /Cannot assign to read only property/);
  });

  it('should score technologies correctly', () => {
    const pgScores = technologyScoringEngine.scoreDatabase('PostgreSQL');
    assert.strictEqual(pgScores.performance, 90);
    assert.strictEqual(pgScores.security, 95);
    assert.strictEqual(pgScores.overall, 90);
  });

});
