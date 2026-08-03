import { PromptType } from './promptTypes';
import { planningTemplate } from './templates/planning.template';
import { codingTemplate } from './templates/coding.template';
import { reviewTemplate } from './templates/review.template';
import { testingTemplate } from './templates/testing.template';
import { debuggingTemplate } from './templates/debugging.template';
import { documentationTemplate } from './templates/documentation.template';

export class TemplateEngine {
  public getTemplate(type: PromptType): { name: string; systemInstructions: string; developerInstructions: string } {
    switch (type) {
      case PromptType.Planning:
        return planningTemplate;
      case PromptType.Coding:
      case PromptType.Refactoring:
        return codingTemplate;
      case PromptType.Review:
      case PromptType.Architecture:
      case PromptType.Security:
        return reviewTemplate;
      case PromptType.Testing:
        return testingTemplate;
      case PromptType.Debugging:
        return debuggingTemplate;
      case PromptType.Documentation:
      case PromptType.Chat:
      default:
        return documentationTemplate;
    }
  }
}

export const templateEngine = new TemplateEngine();
