import { IEntityExtractionOutput } from '../entity-extractor/types';
import { IProjectContextOutput } from '../project-context-analyzer/types';

export class PromptContextValidator {
  public validate(
    intent: string,
    extracted: IEntityExtractionOutput,
    workspace: IProjectContextOutput
  ): string[] {
    const warnings: string[] = [];

    // 1. Missing Backend framework
    if (!extracted.backend.value && !workspace.techStack.backendFramework) {
      warnings.push('No backend framework specified.');
    }

    // 2. Missing Database
    if (!extracted.database.value && !workspace.techStack.database) {
      warnings.push('No database selected.');
    }

    // 3. Conflicting frontend/backend technologies
    if (extracted.frontend.value && workspace.techStack.frontendFramework && extracted.frontend.value !== workspace.techStack.frontendFramework) {
      warnings.push(`Conflicting frontend framework: requested '${extracted.frontend.value}' but workspace contains '${workspace.techStack.frontendFramework}'.`);
    }

    if (extracted.backend.value && workspace.techStack.backendFramework && extracted.backend.value !== workspace.techStack.backendFramework) {
      warnings.push(`Conflicting backend framework: requested '${extracted.backend.value}' but workspace contains '${workspace.techStack.backendFramework}'.`);
    }

    // 4. Project already exists warning
    if (intent === 'NEW_PROJECT' && workspace.workspace.isProjectPresent) {
      warnings.push('Project already exists.');
    }

    // 5. Incomplete requirements warnings
    if (intent === 'NEW_PROJECT' && !extracted.frontend.value && !extracted.backend.value) {
      warnings.push('Incomplete requirements: Neither frontend nor backend was detected in the prompt.');
    }

    return warnings;
  }
}

export const promptContextValidator = new PromptContextValidator();
export default promptContextValidator;
