import { documentationTemplate } from '../templates/documentation.template';

export class DocumentationPromptProvider {
  public getTemplate() {
    return documentationTemplate;
  }
}
