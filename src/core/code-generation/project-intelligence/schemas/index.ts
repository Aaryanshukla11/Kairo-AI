export interface IFeatureMetadata {
  name: string;
  priority: 'MANDATORY' | 'RECOMMENDED' | 'OPTIONAL';
  confidence: number; // 0 to 100
  dependency: string[];
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IBusinessModule {
  name: string;
  purpose: string;
  dependencies: string[];
  suggestedArchitecture: string;
}

export interface IComplexityScores {
  projectComplexity: number;
  technicalComplexity: number;
  businessComplexity: number;
  maintenanceComplexity: number;
  deploymentComplexity: number;
  testingComplexity: number;
  overallRisk: number;
}

export interface IGeneratorStep {
  generatorId: string;
  executionPriority: number; // lower runs first
  required: boolean;
}

export interface IScalabilityEstimation {
  expectedUsers: string;
  expectedTraffic: string;
  dataVolume: string;
  scalingRequirements: string[];
}

export interface IProjectIntelligence {
  readonly category: string;
  readonly domain: string;
  readonly features: IFeatureMetadata[];
  readonly businessModules: IBusinessModule[];
  readonly complexity: IComplexityScores;
  readonly recommendedArchitectures: string[];
  readonly generatorStrategy: IGeneratorStep[];
  readonly technologyHints: string[];
  readonly scalability: IScalabilityEstimation;
  readonly risks: string[];
  readonly summaries: {
    businessSummary: string;
    engineeringSummary: string;
    complexitySummary: string;
    generatorSummary: string;
  };
}
