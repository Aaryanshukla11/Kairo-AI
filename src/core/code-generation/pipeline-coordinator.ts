import { RequirementAnalysisEngine } from './requirement-analysis';
import { enterpriseRequirementBuilder } from './requirement-schema/builders';
import { projectIntelligenceEngine } from './project-intelligence';
import { engineeringDecisionEngine } from './engineering-decision';
import { architectureGeneratorEngine } from './architecture-generator';
import { workspaceScaffolderEngine } from './workspace-scaffolder';
import { projectManifestEngine } from './project-manifest';
import { IProjectManifest } from './project-manifest/schema';
import { logger } from './logger';

export class CodeGenerationPipeline {
  private analysisEngine: RequirementAnalysisEngine;

  constructor() {
    this.analysisEngine = new RequirementAnalysisEngine();
  }

  public run(prompt: string): IProjectManifest {
    logger.info(`[CodeGenerationPipeline] Initiating multi-stage compilation flow for prompt: "${prompt}"`);

    // 1. Requirement Analysis Stage
    const requirementObj = this.analysisEngine.analyzePrompt(prompt);

    // Adapt requirementObj to IEnterpriseRequirement shape
    const identity = {
      projectName: requirementObj.detectedValues.projectType || 'Project',
      projectType: requirementObj.detectedValues.projectType || 'Monolith',
      domain: requirementObj.detectedValues.domain || 'General',
      targetPlatform: requirementObj.detectedValues.targetPlatform || 'web'
    };

    const business = {
      targetUsers: [],
      businessGoal: 'Automated software scaffolding',
      deadlines: requirementObj.detectedValues.deadlines || ''
    };

    const stack = {
      frontend: requirementObj.detectedValues.frontendPreference || 'React',
      backend: requirementObj.detectedValues.backendPreference || 'FastAPI',
      database: requirementObj.detectedValues.databasePreference || 'PostgreSQL',
      authentication: requirementObj.detectedValues.authentication || 'JWT',
      authorization: 'rbac',
      deployment: requirementObj.detectedValues.deploymentPreference || 'Docker',
      testing: 'pytest',
      documentation: 'swagger'
    };

    const quality = {
      performance: [],
      security: [],
      accessibility: []
    };

    const extensions = {
      customInstructions: requirementObj.detectedValues.customInstructions || [],
      generatorPreferences: {},
      futureExtensions: {}
    };

    // 2. Enterprise Schema Validation Pipeline Stage
    const req = enterpriseRequirementBuilder.build(
      identity,
      business,
      stack,
      quality,
      extensions,
      requirementObj.originalPrompt,
      requirementObj.normalizedPrompt
    );

    // 3. Project Intelligence Stage
    const intel = projectIntelligenceEngine.analyze(req);

    // 4. Engineering Decisions Stage
    const decisions = engineeringDecisionEngine.decide(req, intel);

    // 5. System Architecture Blueprint Stage
    const arch = architectureGeneratorEngine.generateBlueprint(decisions);

    // 6. Workspace Scaffolder Blueprint Stage
    const workspace = workspaceScaffolderEngine.generateBlueprint(arch);

    // 7. Project Scaffolding Manifest Stage
    const manifest = projectManifestEngine.generateManifest(workspace);

    logger.info(`[CodeGenerationPipeline] Generation manifest fully compiled. Status Valid: ${manifest.validationReport.isValid}`);
    return manifest;
  }
}

export const codeGenerationPipeline = new CodeGenerationPipeline();
export default codeGenerationPipeline;
