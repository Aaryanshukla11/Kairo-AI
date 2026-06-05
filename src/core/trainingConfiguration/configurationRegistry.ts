import { TrainingConfigModel } from './configurationTypes';

export class ConfigurationRegistry {
  private configs = new Map<string, TrainingConfigModel>();

  public register(config: TrainingConfigModel): void {
    const key = `${config.trainingType}:${config.version}`;
    
    // Immutability audit
    if (this.configs.has(key)) {
      throw new Error(`Versioning Error: Configuration for type ${config.trainingType} version ${config.version} already exists and is immutable.`);
    }

    this.configs.set(key, config);
  }

  public getConfig(trainingType: string, version: string): TrainingConfigModel | undefined {
    return this.configs.get(`${trainingType}:${version}`);
  }

  public listConfigs(): TrainingConfigModel[] {
    return Array.from(this.configs.values());
  }

  public clear(): void {
    this.configs.clear();
  }
}

export const configurationRegistry = new ConfigurationRegistry();
export default configurationRegistry;
