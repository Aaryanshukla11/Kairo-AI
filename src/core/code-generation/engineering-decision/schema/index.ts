export interface IDecisionDetails {
  primary: string;
  secondary: string;
  enterprise: string;
  experimental: string;
  rationale: string[];
  tradeOffs: string;
}

export interface IEngineeringProfile {
  projectName: string;
  profileType: 'MVP' | 'Startup' | 'Enterprise' | 'Healthcare' | 'Fintech';
  architecturePattern: string;
  securityStrategy: string[];
  performanceCaching: string[];
}

export interface IGeneratorConfiguration {
  frontendConfig: Record<string, string>;
  backendConfig: Record<string, string>;
  dbConfig: Record<string, string>;
}

export interface IEngineeringDecision {
  readonly language: IDecisionDetails;
  readonly frontend: IDecisionDetails;
  readonly backend: IDecisionDetails;
  readonly database: IDecisionDetails;
  readonly authentication: IDecisionDetails;
  readonly deployment: IDecisionDetails;
  readonly profile: IEngineeringProfile;
  readonly generatorConfigs: IGeneratorConfiguration;
  readonly compatibilityReport: {
    compatible: boolean;
    conflicts: string[];
  };
}
