import * as assert from 'assert';
import { projectGeneratorEngine } from '../../src/core/codeGeneration/project/projectGeneratorEngine';
import { requirementAnalyzer } from '../../src/core/codeGeneration/project/requirementAnalyzer';
import { projectTypeDetector } from '../../src/core/codeGeneration/project/projectTypeDetector';
import { stackRecommender } from '../../src/core/codeGeneration/project/stackRecommender';
import { architectureGenerator } from '../../src/core/codeGeneration/project/architectureGenerator';
import { blueprintGenerator } from '../../src/core/codeGeneration/project/blueprintGenerator';

describe('Phase 9 — Code Generation Factory Integration Tests', () => {

  const testPrompt = 'Build a Hospital Management System using React, FastAPI, PostgreSQL, JWT Authentication and Docker.';

  describe('Module 1: Requirement Analyzer', () => {
    it('should extract correct project type, domain and database', () => {
      const requirements = requirementAnalyzer.analyze(testPrompt);
      assert.strictEqual(requirements.projectType, 'Hospital Management');
      assert.strictEqual(requirements.domain, 'Healthcare');
      assert.strictEqual(requirements.databaseRequirements, 'PostgreSQL');
      assert.ok(requirements.features.includes('Patient Registration & Intake'));
    });
  });

  describe('Module 2: Project Type Detector', () => {
    it('should classify hospital prompt correctly', () => {
      const reqs = requirementAnalyzer.analyze(testPrompt);
      const type = projectTypeDetector.detect(reqs);
      assert.strictEqual(type, 'Hospital Management');
    });
  });

  describe('Module 3: Stack Recommender', () => {
    it('should recommend correct stack parameters based on prompt keywords', () => {
      const reqs = requirementAnalyzer.analyze(testPrompt);
      const stack = stackRecommender.recommend(reqs);
      assert.strictEqual(stack.frontend, 'React');
      assert.strictEqual(stack.backend, 'FastAPI');
      assert.strictEqual(stack.database, 'PostgreSQL');
      assert.strictEqual(stack.authentication, 'JWT');
      assert.strictEqual(stack.deployment, 'Docker');
    });
  });

  describe('Module 4: Architecture Generator', () => {
    it('should layout structured components and api architectures', () => {
      const reqs = requirementAnalyzer.analyze(testPrompt);
      const stack = stackRecommender.recommend(reqs);
      const arch = architectureGenerator.generate(stack, reqs.projectType);
      assert.ok(arch.routing.includes('/patients'));
      assert.ok(arch.services.includes('PatientService'));
      assert.ok(arch.components.includes('InvoiceTable'));
      assert.ok(arch.folderStructure.children!.some(n => n.name === 'frontend'));
    });
  });

  describe('Module 5: Blueprint Generator', () => {
    it('should map files lists, environment configurations and dependencies', () => {
      const reqs = requirementAnalyzer.analyze(testPrompt);
      const stack = stackRecommender.recommend(reqs);
      const arch = architectureGenerator.generate(stack, reqs.projectType);
      const blueprint = blueprintGenerator.generate(stack, arch, reqs.projectType);
      assert.ok(blueprint.fileList.includes('README.md'));
      assert.ok(blueprint.fileList.includes('frontend/package.json'));
      assert.ok(blueprint.fileList.includes('backend/app/main.py'));
      assert.strictEqual(blueprint.envVariables.DATABASE_URL, 'postgresql://postgres:postgres@db:5432/hospital_db');
    });
  });

  describe('Complete 14-Stage Project Generation Pipeline', () => {
    it('should execute all stages, write all code, and return complete code bases', async () => {
      const result = await projectGeneratorEngine.generateProject(testPrompt);
      assert.ok(result.requirements);
      assert.ok(result.stack);
      assert.ok(result.architecture);
      assert.ok(result.blueprint);
      assert.ok(result.logs.length >= 14);

      // Verify that codebases (frontend, backend, database, auth, APIs, configs, docs, tests, deployments) are generated
      assert.ok(result.files['frontend/src/App.tsx'].includes('App'));
      assert.ok(result.files['backend/app/main.py'].includes('FastAPI'));
      assert.ok(result.files['database/schema.sql'].includes('CREATE TABLE'));
      assert.ok(result.files['backend/app/api/auth.py'].includes('login'));
      assert.ok(result.files['frontend/src/services/apiService.ts'].includes('axios'));
      assert.ok(result.files['Dockerfile'].includes('frontend-builder'));
      assert.ok(result.files['README.md'].includes('Kairo-AI'));
      assert.ok(result.files['frontend/tests/unit/components.test.tsx'].includes('vitest'));
      assert.ok(result.files['.github/workflows/deploy.yml'].includes('deploy'));
    });
  });

});
