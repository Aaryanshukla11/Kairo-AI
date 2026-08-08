export interface IEntity<T> {
  readonly value: T | null;
  readonly confidence: number;
}

export interface IEntityExtractionOutput {
  readonly projectName: IEntity<string>;
  readonly projectType: IEntity<string>;
  readonly language: IEntity<string>;
  readonly frontend: IEntity<string>;
  readonly backend: IEntity<string>;
  readonly database: IEntity<string>;
  readonly authMethod: IEntity<string>;
  readonly apiStyle: IEntity<string>;
  readonly uiFramework: IEntity<string>;
  readonly cssFramework: IEntity<string>;
  readonly stateManagement: IEntity<string>;
  readonly buildTool: IEntity<string>;
  readonly packageManager: IEntity<string>;
  readonly testingFramework: IEntity<string>;
  readonly deploymentTarget: IEntity<string>;
  readonly operatingSystem: IEntity<string>;
  readonly targetPlatform: IEntity<string>;
  readonly features: readonly string[];
  readonly integrations: readonly string[];
  readonly aiFeatures: readonly string[];
  readonly specialRequirements: readonly string[];
  readonly confidence: number; // overall confidence rating 0 to 1
}
