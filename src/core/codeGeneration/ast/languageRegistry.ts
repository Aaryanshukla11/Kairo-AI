import { BaseAstProvider } from './providers/baseAstProvider';
import { typescriptProvider } from './providers/typescriptProvider';
import { javascriptProvider } from './providers/javascriptProvider';
import { pythonProvider } from './providers/pythonProvider';

export class LanguageRegistry {
  private providers = new Map<string, BaseAstProvider>();

  constructor() {
    this.providers.set('typescript', typescriptProvider);
    this.providers.set('javascript', javascriptProvider);
    this.providers.set('python', pythonProvider);
  }

  public getProvider(language: string): BaseAstProvider {
    const provider = this.providers.get(language.toLowerCase());
    if (!provider) {
      throw new Error(`AST provider error: Unsupported language "${language}"`);
    }
    return provider;
  }
}

export const languageRegistry = new LanguageRegistry();
