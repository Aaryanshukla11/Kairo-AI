import { conventionAnalyzer } from './conventionAnalyzer';
import { conventionEvents } from './conventionEvents';
import { ConventionProfile } from './conventionTypes';

export class ConventionEngine {
  public async analyzeConventions(files: { path: string; content: string }[]): Promise<ConventionProfile> {
    return conventionAnalyzer.analyze(files);
  }

  public subscribe(listener: any): () => void {
    return conventionEvents.subscribe(listener);
  }
}

export const conventionEngine = new ConventionEngine();
