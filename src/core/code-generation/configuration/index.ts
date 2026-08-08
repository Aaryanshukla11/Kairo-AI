import { GenerationConfig } from '../types';

export class CentralConfiguration {
  private config: GenerationConfig = {
    generatorTimeoutMs: 30000,
    retryCount: 3,
    validationMode: 'strict',
    loggingLevel: 'INFO',
    allowParallelExecution: false,
    memoryLimitMb: 512,
    preferredLanguages: ['TypeScript', 'Python'],
    preferredFrameworks: ['React', 'FastAPI', 'Express']
  };

  public getConfig(): GenerationConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<GenerationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}

export const centralConfig = new CentralConfiguration();
