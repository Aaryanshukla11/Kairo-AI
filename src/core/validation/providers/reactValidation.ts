import { ValidationProvider } from '../validationRegistry';

export class ReactValidation implements ValidationProvider {
  public name = 'ReactValidationRules';
  public validateContent(content: string): string[] {
    return content.includes('rules-of-hooks') ? ['REACT-01: Hooks rule violation'] : [];
  }
}

export const reactValidation = new ReactValidation();
