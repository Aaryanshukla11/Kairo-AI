export interface ISchemaVersionInfo {
  schemaVersion: string;
  creationTime: number;
  lastUpdated: number;
  compatibilityVersion: string;
  migrationVersion: string;
}

export interface IProjectIdentity {
  projectName: string;
  projectType: string;
  domain: string;
  targetPlatform: string;
}

export interface IBusinessInfo {
  targetUsers: string[];
  businessGoal: string;
  deadlines: string;
}

export interface ITechnicalStack {
  frontend: string;
  backend: string;
  database: string;
  authentication: string;
  authorization: string;
  deployment: string;
  testing: string;
  documentation: string;
}

export interface IQualityAttributes {
  performance: string[];
  security: string[];
  accessibility: string[];
}

export interface IExtensionFields {
  customInstructions: string[];
  generatorPreferences: Record<string, any>;
  futureExtensions: Record<string, any>;
}

export interface IRiskIndicator {
  field: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  recoverySuggestion: string;
}

export interface IValidationDetails {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  risks: IRiskIndicator[];
  validationDurationMs: number;
}

export interface IEnterpriseRequirement {
  readonly versionInfo: ISchemaVersionInfo;
  readonly identity: IProjectIdentity;
  readonly business: IBusinessInfo;
  readonly stack: ITechnicalStack;
  readonly quality: IQualityAttributes;
  readonly extensions: IExtensionFields;
  readonly validation: IValidationDetails;
  readonly originalPrompt: string;
  readonly normalizedPrompt: string;
}
