import { namingAnalyzer } from './namingAnalyzer';
import { namingEvents } from './namingEvents';
import { NamingReport } from './namingTypes';

export class NamingEngine {
  public async generateNames(
    baseTerm: string,
    symbolType: string,
    casing: 'camelCase' | 'snakeCase' | 'PascalCase',
    existingFiles: string[]
  ): Promise<NamingReport> {
    return namingAnalyzer.analyzeAndGenerate(baseTerm, symbolType, casing, existingFiles);
  }

  public subscribe(listener: any): () => void {
    return namingEvents.subscribe(listener);
  }
}

export const namingEngine = new NamingEngine();
