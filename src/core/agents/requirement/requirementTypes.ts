export type RequirementStage =
  | 'PROMPT_RECEIVED'
  | 'REQUIREMENT_ANALYSIS_STARTED'
  | 'REQUIREMENT_OBJECT_CREATED'
  | 'VALIDATION_PASSED'
  | 'VALIDATION_FAILED'
  | 'RESULT_RETURNED';

export interface IRequirementAgentLog {
  readonly stage: RequirementStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IPreferredStack {
  readonly language: string | null;
  readonly frontend: string | null;
  readonly backend: string | null;
  readonly database: string | null;
  readonly buildTool: string | null;
}

export interface IRequirementObject {
  readonly requestId: string;
  readonly sessionId: string;
  readonly userIntent: string;
  readonly projectCategory: string;
  readonly projectScope: string;
  readonly features: readonly string[];
  readonly constraints: readonly string[];
  readonly preferredStack: IPreferredStack;
  readonly priority: string;
  readonly estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'COMPLEX';
  readonly expectedDeliverables: readonly string[];
  readonly metadata: {
    readonly timestamp: number;
    readonly version: string;
    readonly rawPromptLength: number;
  };
  readonly validationStatus: 'PASSED' | 'FAILED';
  readonly validationErrors?: readonly string[];
}
