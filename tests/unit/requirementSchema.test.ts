import * as assert from 'assert';
import { enterpriseRequirementBuilder } from '../../src/core/code-generation/requirement-schema/builders';
import { requirementSerializer } from '../../src/core/code-generation/requirement-schema/serializers';
import { schemaMigrationEngine, ISchemaMigrator } from '../../src/core/code-generation/requirement-schema/migration';

describe('Phase 9 - Enterprise Requirement Schema & Validation Tests', () => {

  const dummyIdentity = {
    projectName: 'Hospital App',
    projectType: 'Hospital Management',
    domain: 'Healthcare',
    targetPlatform: 'web'
  };

  const dummyBusiness = {
    targetUsers: ['Doctors', 'Patients'],
    businessGoal: 'Improve scheduling efficiency',
    deadlines: '2026-09-01'
  };

  const dummyStack = {
    frontend: 'reactjs', // needs normalization -> React
    backend: 'FastAPI',
    database: 'postgres', // needs normalization -> PostgreSQL
    authentication: 'jwt', // needs normalization -> JWT
    authorization: 'rbac',
    deployment: 'Docker',
    testing: 'pytest',
    documentation: 'swagger'
  };

  const dummyQuality = {
    performance: ['Load time < 1s'],
    security: ['Encrypted weight imports'],
    accessibility: ['WCAG AA compliance']
  };

  const dummyExtensions = {
    customInstructions: ['Optimize docker layer caches'],
    generatorPreferences: { strictTypes: true },
    futureExtensions: {}
  };

  describe('Terms Normalization in Schema Builders', () => {
    it('should normalize abbreviations and casing inside the tech stack', () => {
      const req = enterpriseRequirementBuilder.build(
        dummyIdentity,
        dummyBusiness,
        dummyStack,
        dummyQuality,
        dummyExtensions,
        'Original text prompt',
        'Clean text prompt'
      );

      assert.strictEqual(req.stack.frontend, 'React');
      assert.strictEqual(req.stack.database, 'PostgreSQL');
      assert.strictEqual(req.stack.authentication, 'JWT');
    });
  });

  describe('Conflict Detection', () => {
    it('should throw ConflictError for incompatible technology combinations', () => {
      const invalidIdentity = {
        projectName: 'Web App',
        projectType: 'SaaS',
        domain: 'Business',
        targetPlatform: 'web'
      };

      const invalidStack = {
        frontend: 'Flutter',
        backend: 'Next.js', // Conflicting combination (Flutter + Next.js web build)
        database: 'PostgreSQL',
        authentication: 'JWT',
        authorization: 'rbac',
        deployment: 'web',
        testing: 'jest',
        documentation: 'swagger'
      };

      assert.throws(() => {
        enterpriseRequirementBuilder.build(
          invalidIdentity,
          dummyBusiness,
          invalidStack,
          dummyQuality,
          dummyExtensions,
          'Prompt text',
          'Prompt text'
        );
      }, /ConflictError/);
    });
  });

  describe('Dependency Validation', () => {
    it('should throw DependencyValidationError if PostgreSQL database lacks a backend stack', () => {
      const invalidStack = {
        frontend: 'React',
        backend: '', // Missing backend framework configuration
        database: 'PostgreSQL',
        authentication: 'JWT',
        authorization: 'rbac',
        deployment: 'Docker',
        testing: 'jest',
        documentation: 'swagger'
      };

      assert.throws(() => {
        enterpriseRequirementBuilder.build(
          dummyIdentity,
          dummyBusiness,
          invalidStack,
          dummyQuality,
          dummyExtensions,
          'Prompt text',
          'Prompt text'
        );
      }, /DependencyValidationError/);
    });
  });

  describe('Risk Analysis', () => {
    it('should catch experimental stack combinations and throw RiskValidationError', () => {
      const experimentalStack = {
        frontend: 'Svelte',
        backend: 'Spring Boot', // Svelte + Spring Boot is experimental
        database: 'PostgreSQL',
        authentication: 'JWT',
        authorization: 'rbac',
        deployment: 'Docker',
        testing: 'jest',
        documentation: 'swagger'
      };

      assert.throws(() => {
        enterpriseRequirementBuilder.build(
          dummyIdentity,
          dummyBusiness,
          experimentalStack,
          dummyQuality,
          dummyExtensions,
          'Prompt text',
          'Prompt text'
        );
      }, /RiskValidationError/);
    });
  });

  describe('Serialization System', () => {
    it('should serialize to JSON and parse back successfully as frozen object', () => {
      const req = enterpriseRequirementBuilder.build(
        dummyIdentity,
        dummyBusiness,
        dummyStack,
        dummyQuality,
        dummyExtensions,
        'Original prompt',
        'Normalized prompt'
      );

      const jsonStr = requirementSerializer.serialize(req);
      const parsed = requirementSerializer.deserialize(jsonStr);

      assert.strictEqual(parsed.identity.projectName, 'Hospital App');
      assert.strictEqual(parsed.stack.frontend, 'React');
      assert.ok(Object.isFrozen(parsed));
    });
  });

  describe('Schema Migrations Engine', () => {
    class MockMigrator implements ISchemaMigrator {
      public sourceVersion = '1.0.0';
      public targetVersion = '2.0.0';
      public migrate(req: any): any {
        req.identity.projectName = req.identity.projectName + ' Migrated';
        req.versionInfo.schemaVersion = '2.0.0';
        return req;
      }
    }

    it('should register migrators and convert old schemas forward', () => {
      const req = enterpriseRequirementBuilder.build(
        dummyIdentity,
        dummyBusiness,
        dummyStack,
        dummyQuality,
        dummyExtensions,
        'Prompt text',
        'Prompt text'
      );

      schemaMigrationEngine.registerMigrator(new MockMigrator());
      const migrated = schemaMigrationEngine.migrate(req, '2.0.0');

      assert.strictEqual(migrated.versionInfo.schemaVersion, '2.0.0');
      assert.strictEqual(migrated.identity.projectName, 'Hospital App Migrated');
    });
  });

});
