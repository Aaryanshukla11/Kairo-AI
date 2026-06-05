import * as assert from 'assert';
import { promptContextBuilder } from '../../src/core/prompt-context-builder';
import { IPromptProcessorOutput } from '../../src/core/prompt-processor/types';
import { IEntityExtractionOutput } from '../../src/core/entity-extractor/types';
import { IProjectContextOutput } from '../../src/core/project-context-analyzer/types';

describe('Sprint 1 - Prompt Context Builder Module Tests', () => {

  const mockProcessorOutput: IPromptProcessorOutput = {
    id: 'test-uuid-123',
    timestamp: 1234567890,
    rawPrompt: 'Build a nextjs app with postgres database.',
    normalizedPrompt: 'Build a Next.js app with PostgreSQL database.',
    intent: 'NEW_PROJECT',
    confidence: 0.95,
    metadata: {
      length: 42,
      lineCount: 1,
      hasMarkdown: false,
      detectedTech: ['Next.js', 'PostgreSQL']
    }
  };

  const mockExtractorOutput: IEntityExtractionOutput = {
    projectName: { value: 'MyNextApp', confidence: 0.9 },
    projectType: { value: 'Dashboard', confidence: 0.95 },
    language: { value: 'TypeScript', confidence: 0.98 },
    frontend: { value: 'Next.js', confidence: 0.98 },
    backend: { value: null, confidence: 0.0 },
    database: { value: 'PostgreSQL', confidence: 0.98 },
    authMethod: { value: 'JWT', confidence: 0.9 },
    apiStyle: { value: 'REST', confidence: 0.85 },
    uiFramework: { value: null, confidence: 0.0 },
    cssFramework: { value: 'Tailwind CSS', confidence: 0.98 },
    stateManagement: { value: null, confidence: 0.0 },
    buildTool: { value: null, confidence: 0.0 },
    packageManager: { value: null, confidence: 0.0 },
    testingFramework: { value: null, confidence: 0.0 },
    deploymentTarget: { value: null, confidence: 0.0 },
    operatingSystem: { value: null, confidence: 0.0 },
    targetPlatform: { value: null, confidence: 0.0 },
    features: ['Authentication', 'Dashboard'],
    integrations: [],
    aiFeatures: [],
    specialRequirements: [],
    confidence: 0.9
  };

  const mockAnalyzerOutput: IProjectContextOutput = {
    workspace: {
      isEmpty: true,
      isProjectPresent: false,
      isMonorepo: false,
      appsCount: 0,
      packagesCount: 0,
      hasGit: false,
      packageManager: null
    },
    projectType: 'Unknown',
    techStack: {
      language: null,
      frontendFramework: null,
      backendFramework: null,
      database: null,
      orm: null,
      authLibrary: null,
      uiLibrary: null,
      cssFramework: null,
      stateManagement: null,
      testingFramework: null,
      buildTool: null
    },
    importantFiles: [],
    entryPoints: [],
    dependencies: {
      installed: {},
      missing: [],
      unused: [],
      peerIssues: []
    },
    projectHealth: 'Healthy'
  };

  it('should build a unified, frozen prompt context object', () => {
    const result = promptContextBuilder.buildContext(
      mockProcessorOutput,
      mockExtractorOutput,
      mockAnalyzerOutput
    );

    // Verify properties merged correctly
    assert.strictEqual(result.id, 'test-uuid-123');
    assert.strictEqual(result.intent, 'NEW_PROJECT');
    assert.strictEqual(result.projectInfo.name, 'MyNextApp');
    assert.strictEqual(result.detectedTechnologies.frontend, 'Next.js');
    assert.strictEqual(result.detectedTechnologies.database, 'PostgreSQL');
    assert.strictEqual(result.detectedTechnologies.language, 'TypeScript');

    // Verify warnings: missing backend warning should trigger
    assert.ok(result.warnings.includes('No backend framework specified.'));

    // Verify immutability
    assert.throws(() => {
      (result as any).confidence = 0.99;
    }, /Cannot assign to read only property/);
  });

  it('should generate conflicting technology warnings', () => {
    const conflictingAnalyzer: IProjectContextOutput = {
      ...mockAnalyzerOutput,
      workspace: {
        ...mockAnalyzerOutput.workspace,
        isProjectPresent: true
      },
      techStack: {
        ...mockAnalyzerOutput.techStack,
        frontendFramework: 'React',
        backendFramework: 'NestJS'
      }
    };

    const result = promptContextBuilder.buildContext(
      mockProcessorOutput,
      mockExtractorOutput,
      conflictingAnalyzer
    );

    // Warn about conflict: Next.js requested but React present in workspace
    assert.ok(result.warnings.some(w => w.includes('Conflicting frontend framework')));
    // Warn about project already exists for NEW_PROJECT intent
    assert.ok(result.warnings.includes('Project already exists.'));
  });

});
