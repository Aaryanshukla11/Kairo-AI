export type EngineeringDecisionStage =
  | 'DECISION_ANALYSIS_STARTED'
  | 'TECHNOLOGY_SELECTION'
  | 'ARCHITECTURE_SELECTION'
  | 'DEPENDENCY_RESOLUTION'
  | 'ENGINEERING_DECISION_REPORT_CREATED'
  | 'REPORT_RETURNED';

export interface IEngineeringDecisionLog {
  readonly stage: EngineeringDecisionStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IDatabaseDecision {
  readonly system: string;
  readonly ORM: string;
  readonly pooling: boolean;
  readonly migrationStrategy: string;
  readonly rationale: string;
}

export interface IAuthenticationDecision {
  readonly strategy: string;
  readonly tokenType: string;
  readonly rationale: string;
}

export interface IApiDecision {
  readonly style: 'REST' | 'GraphQL' | 'gRPC';
  readonly format: string;
  readonly rationale: string;
}

export interface IBuildStrategy {
  readonly tool: string;
  readonly bundler: string;
  readonly target: string;
  readonly rationale: string;
}

export interface ITestingStrategy {
  readonly unitFramework: string;
  readonly integrationFramework: string;
  readonly rationale: string;
}

export interface IFolderStructureStrategy {
  readonly pattern: 'feature-based' | 'layer-based' | 'modular';
  readonly description: string;
  readonly rationale: string;
}

export interface ICodingStandards {
  readonly styleGuide: string;
  readonly linter: string;
  readonly formatter: string;
  readonly typeSafety: string;
}

export interface IEngineeringDecisionReport {
  readonly requestId: string;
  readonly sessionId: string;
  readonly selectedArchitecture: string;
  readonly selectedTechStack: {
    readonly language: string;
    readonly frontend: string | null;
    readonly backend: string | null;
    readonly database: string | null;
    readonly buildTool: string | null;
    readonly stateManagement: string | null;
    readonly deployment: string | null;
  };
  readonly selectedFrameworks: {
    readonly uiFramework: string | null;
    readonly serverFramework: string | null;
    readonly ORM: string | null;
  };
  readonly databaseDecision: IDatabaseDecision;
  readonly authenticationDecision: IAuthenticationDecision;
  readonly apiDecision: IApiDecision;
  readonly buildStrategy: IBuildStrategy;
  readonly testingStrategy: ITestingStrategy;
  readonly folderStructureStrategy: IFolderStructureStrategy;
  readonly codingStandards: ICodingStandards;
  readonly decisionRationales: Record<string, string>;
  readonly metadata: {
    readonly timestamp: number;
    readonly version: string;
  };
}
