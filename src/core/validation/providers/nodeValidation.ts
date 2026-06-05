import { ValidationProvider } from '../validationRegistry';

export class NodeValidation implements ValidationProvider {
  public name = 'NodeValidationRules';
  public validateContent(content: string): string[] {
    return content.includes('require(') ? ['NODE-01: Synchronous require import used'] : [];
  }
}

export const nodeValidation = new NodeValidation();
