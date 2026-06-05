import { PromptType } from './promptTypes';
import { codingTemplate, debuggingTemplate, refactoringTemplate, explanationTemplate, testingTemplate } from './templates';

export class PromptTemplateRegistry {
  /**
   * Resolves template pairs matching selected PromptType tags.
   */
  public getTemplate(type: PromptType): { systemPrompt: string; developerPrompt: string } {
    switch (type) {
      case PromptType.CodeGen:
        return codingTemplate;
      case PromptType.BugFix:
        return debuggingTemplate;
      case PromptType.Refactor:
        return refactoringTemplate;
      case PromptType.Explanation:
        return explanationTemplate;
      case PromptType.Testing:
        return testingTemplate;
      case PromptType.ArchReview:
        return {
          systemPrompt: 'You are an Enterprise System Architect analyzing module designs, file networks, and project dependencies.',
          developerPrompt: 'Assess the structural components and recommend code partitioning, dependencies pruning, and patterns updates.'
        };
      case PromptType.Documentation:
        return {
          systemPrompt: 'You are a technical writer specializing in clean, developer-facing markdown documentation and APIs references.',
          developerPrompt: 'Write READMEs, API endpoints guides, and architecture summaries based on the provided project context.'
        };
      default:
        return codingTemplate;
    }
  }
}

export const promptTemplateRegistry = new PromptTemplateRegistry();
