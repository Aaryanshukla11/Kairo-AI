export type ProjectIntelligenceStage =
  | 'INTELLIGENCE_ANALYSIS_STARTED'
  | 'PROJECT_CLASSIFICATION'
  | 'STACK_RECOMMENDATION'
  | 'DEPENDENCY_ANALYSIS'
  | 'INTELLIGENCE_REPORT_CREATED'
  | 'REPORT_RETURNED';

export interface IProjectIntelligenceLog {
  readonly stage: ProjectIntelligenceStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export type ProjectTypeClassification =
  | 'New Project'
  | 'Existing Project'
  | 'Feature Update'
  | 'Bug Fix'
  | 'Refactoring';

export interface IProjectIntelligenceReport {
  readonly requestId: string;
  readonly sessionId: string;
  readonly projectType: ProjectTypeClassification;
  readonly suggestedArchitecture: string;
  readonly suggestedTechStack: {
    readonly language: string;
    readonly frontend: string | null;
    readonly backend: string | null;
    readonly database: string | null;
    readonly buildTool: string | null;
  };
  readonly requiredModules: readonly string[];
  readonly dependencyList: readonly string[];
  readonly estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'COMPLEX';
  readonly riskAssessment: readonly string[];
  readonly missingInformation: readonly string[];
  readonly recommendedExecutionStrategy: 'full_project' | 'file_modification' | 'api_only' | 'refactor_module';
  readonly metadata: {
    readonly timestamp: number;
    readonly version: string;
  };
}
