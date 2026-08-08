import * as assert from 'assert';
import { projectIntelligenceEngine } from '../../src/core/code-generation/project-intelligence';
import { enterpriseRequirementBuilder } from '../../src/core/code-generation/requirement-schema/builders';

describe('Phase 9 - Project Intelligence Engine Tests', () => {

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

  it('should analyze validated requirements and generate structured project intelligence details', () => {
    // 1. Build requirement contract
    const req = enterpriseRequirementBuilder.build(
      dummyIdentity,
      dummyBusiness,
      dummyStack,
      dummyQuality,
      dummyExtensions,
      'Build a Hospital Management app using React and Postgres',
      'Build a Hospital Management app using React and Postgres'
    );

    // 2. Run Project Intelligence
    const intel = projectIntelligenceEngine.analyze(req);

    // Verify Classification and Domain
    assert.strictEqual(intel.category, 'Hospital Management');
    assert.strictEqual(intel.domain, 'Healthcare');

    // Verify discovered features & modules
    assert.ok(intel.features.some(f => f.name === 'Scheduling'));
    assert.ok(intel.features.some(f => f.name === 'Authentication'));
    assert.ok(intel.businessModules.some(m => m.name === 'Appointments Scheduling'));

    // Verify Complexity Scores calculations
    assert.ok(intel.complexity.projectComplexity > 0);
    assert.ok(intel.complexity.technicalComplexity > 30);
    assert.ok(intel.complexity.overallRisk > 0);

    // Verify Recommended Architectures strategy
    assert.ok(intel.recommendedArchitectures.includes('Clean Architecture'));

    // Verify generator sequence strategy - Database runs before Frontend
    const dbGen = intel.generatorStrategy.find(s => s.generatorId === 'DatabaseGenerator');
    const feGen = intel.generatorStrategy.find(s => s.generatorId === 'FrontendGenerator');
    assert.ok(dbGen!.executionPriority < feGen!.executionPriority);

    // Verify reports summaries
    assert.ok(intel.summaries.businessSummary.includes('Hospital Management'));
    assert.ok(intel.summaries.engineeringSummary.includes('code generation stages'));
  });

  it('should correctly configure scalability estimations for high-bandwidth apps', () => {
    const streamingIdentity = {
      projectName: 'Streaming Video App',
      projectType: 'Streaming Platform',
      domain: 'Media',
      targetPlatform: 'web'
    };

    const streamingStack = {
      frontend: 'React',
      backend: 'Express',
      database: 'MongoDB',
      authentication: 'JWT',
      authorization: 'rbac',
      deployment: 'Docker',
      testing: 'jest',
      documentation: 'swagger'
    };

    const req = enterpriseRequirementBuilder.build(
      streamingIdentity,
      dummyBusiness,
      streamingStack,
      dummyQuality,
      dummyExtensions,
      'Build a Netflix clone',
      'Build a Netflix clone'
    );

    const intel = projectIntelligenceEngine.analyze(req);

    assert.strictEqual(intel.category, 'Streaming Platform');
    assert.strictEqual(intel.scalability.expectedUsers, '100k+ concurrent users');
    assert.ok(intel.scalability.scalingRequirements.includes('CDN caching layers'));
  });

});
