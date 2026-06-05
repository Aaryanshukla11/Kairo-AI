import { GeneratedProject } from './projectTypes';
import { requirementAnalyzer } from './requirementAnalyzer';
import { projectTypeDetector } from './projectTypeDetector';
import { stackRecommender } from './stackRecommender';
import { architectureGenerator } from './architectureGenerator';
import { blueprintGenerator } from './blueprintGenerator';
import { frontendGenerator } from './frontendGenerator';
import { backendGenerator } from './backendGenerator';
import { databaseGenerator } from './databaseGenerator';
import { authGenerator } from './authGenerator';
import { apiGenerator } from './apiGenerator';
import { configGenerator } from './configGenerator';
import { documentationGenerator } from './documentationGenerator';
import { testingGenerator } from './testingGenerator';
import { deploymentGenerator } from './deploymentGenerator';

export class ProjectGeneratorEngine {
  public async generateProject(prompt: string): Promise<GeneratedProject> {
    const logs: string[] = [];
    const files: Record<string, string> = {};

    logs.push(`[ProjectGeneratorEngine] Starting project generation pipeline for prompt: "${prompt}"`);

    // 1. Requirement Analysis
    logs.push(`[ProjectGeneratorEngine] Executing Module 1: Requirement Analysis...`);
    const requirements = requirementAnalyzer.analyze(prompt);
    logs.push(`[ProjectGeneratorEngine] Extracted domain "${requirements.domain}" and database "${requirements.databaseRequirements}".`);

    // 2. Project Type Detection
    logs.push(`[ProjectGeneratorEngine] Executing Module 2: Project Type Detection...`);
    const projectType = projectTypeDetector.detect(requirements);
    requirements.projectType = projectType;
    logs.push(`[ProjectGeneratorEngine] Classified project type as: "${projectType}"`);

    // 3. Stack Recommendation
    logs.push(`[ProjectGeneratorEngine] Executing Module 3: Stack Recommendation...`);
    const stack = stackRecommender.recommend(requirements);
    logs.push(`[ProjectGeneratorEngine] Recommended Stack: Frontend: ${stack.frontend}, Backend: ${stack.backend}, DB: ${stack.database}`);

    // 4. Architecture Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 4: Architecture Generator...`);
    const architecture = architectureGenerator.generate(stack, projectType);
    logs.push(`[ProjectGeneratorEngine] Structured routing, component layout tree, and services bindings.`);

    // 5. Blueprint Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 5: Project Blueprint Generator...`);
    const blueprint = blueprintGenerator.generate(stack, architecture, projectType);
    logs.push(`[ProjectGeneratorEngine] Mapped ${blueprint.fileList.length} files in blueprint lists.`);

    // 6. Frontend Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 6: Frontend Generator...`);
    frontendGenerator.generate(stack, projectType, files);

    // 7. Backend Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 7: Backend Generator...`);
    backendGenerator.generate(stack, projectType, files);

    // 8. Database Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 8: Database Generator...`);
    databaseGenerator.generate(stack.database, projectType, files);

    // 9. Authentication Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 9: Authentication Generator...`);
    authGenerator.generate(stack, files);

    // 10. API Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 10: API Generator...`);
    apiGenerator.generate(stack, files);

    // 11. Configuration Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 11: Configuration Generator...`);
    configGenerator.generate(stack, files);

    // 12. Documentation Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 12: Documentation Generator...`);
    documentationGenerator.generate(stack, projectType, files);

    // 13. Testing Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 13: Testing Generator...`);
    testingGenerator.generate(stack, files);

    // 14. Deployment Generation
    logs.push(`[ProjectGeneratorEngine] Executing Module 14: Deployment Generator...`);
    deploymentGenerator.generate(stack, files);

    logs.push(`[ProjectGeneratorEngine] Successfully compiled all 14 project modules. Generated ${Object.keys(files).length} files.`);

    return {
      requirements,
      stack,
      architecture,
      blueprint,
      files,
      logs
    };
  }
}

export const projectGeneratorEngine = new ProjectGeneratorEngine();
export default projectGeneratorEngine;
