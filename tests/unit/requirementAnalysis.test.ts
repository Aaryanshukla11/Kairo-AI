import * as assert from 'assert';
import { requirementAnalysisEngine } from '../../src/core/code-generation/requirement-analysis';

describe('Phase 9 - Requirement Analysis Engine Tests', () => {

  describe('Prompt Parsing & Tokenization', () => {
    it('should clean spaces, extract sentences and produce lower-case tokens list', () => {
      const prompt = "  Build a   Hospital Management System.  Use React and Postgres. ";
      const reqObj = requirementAnalysisEngine.analyzePrompt(prompt);

      assert.strictEqual(reqObj.originalPrompt, prompt);
      assert.strictEqual(reqObj.normalizedPrompt, "Build a Hospital Management System. Use React and Postgres.");
    });
  });

  describe('Terms Normalization', () => {
    it('should normalize abbreviations and alternate casing to standard formats', () => {
      const prompt = "Build a CRM using JS, NextJS, Postgres, OAuth2, and Deploy on Docker";
      const reqObj = requirementAnalysisEngine.analyzePrompt(prompt);

      assert.strictEqual(reqObj.detectedValues.programmingLanguagePreference, 'JavaScript');
      assert.strictEqual(reqObj.detectedValues.frontendPreference, 'Next.js');
      assert.strictEqual(reqObj.detectedValues.databasePreference, 'PostgreSQL');
      assert.strictEqual(reqObj.detectedValues.authentication, 'OAuth');
      assert.strictEqual(reqObj.detectedValues.deploymentPreference, 'Docker');
    });
  });

  describe('Confidence Scoring & Ambiguity Detection', () => {
    it('should give 100% confidence to explicit values, 40% for inferences, and identify missing ones', () => {
      const prompt = "Build a Hospital Management System using React.";
      const reqObj = requirementAnalysisEngine.analyzePrompt(prompt);

      // React is explicit
      assert.strictEqual(reqObj.confidenceScores.frontendPreference, 100);
      // Postgres database is inferred based on Hospital type
      assert.strictEqual(reqObj.confidenceScores.databasePreference, 40);
      // Backend framework is completely missing
      assert.strictEqual(reqObj.confidenceScores.backendPreference, 0);

      // Should identify missing backend and database
      assert.ok(reqObj.unresolvedFields.includes('backendPreference'));
      assert.ok(reqObj.unresolvedFields.includes('databasePreference'));
    });
  });

  describe('Clarification Engine', () => {
    it('should generate prioritized clarification questions sorted by severity levels', () => {
      const prompt = "Build a static portfolio website.";
      const reqObj = requirementAnalysisEngine.analyzePrompt(prompt);

      assert.ok(reqObj.clarificationQuestions.length > 0);
      
      // Critical questions (e.g. frontend/backend frameworks) should come first
      const firstQuestion = reqObj.clarificationQuestions[0];
      assert.ok(['CRITICAL', 'HIGH'].includes(firstQuestion.priority));
    });
  });

  describe('Validation Checks', () => {
    it('should catch conflicting technology stacks combinations', () => {
      // NestJS is a Node/JS framework, which conflicts with python preference
      const prompt = "Build a project using NestJS and python.";
      const reqObj = requirementAnalysisEngine.analyzePrompt(prompt);

      assert.strictEqual(reqObj.validationReport.isValid, false);
      assert.ok(reqObj.validationReport.errors.some(e => e.includes('conflicts with Python')));
      assert.ok(reqObj.validationReport.conflictingTech.includes('NestJS'));
      assert.ok(reqObj.validationReport.conflictingTech.includes('Python'));
    });
  });

  describe('Immutability Checks', () => {
    it('should ensure the returned RequirementObject is completely frozen', () => {
      const prompt = "Build a CRM";
      const reqObj = requirementAnalysisEngine.analyzePrompt(prompt);

      assert.throws(() => {
        (reqObj as any).originalPrompt = 'hack';
      }, /Cannot assign to read only property/);

      assert.throws(() => {
        (reqObj.detectedValues as any).projectType = 'hack';
      }, /Cannot assign to read only property/);
    });
  });

});
