import { IRequirementObject } from '../requirement/requirementTypes';
import { IProjectIntelligenceReport } from '../projectIntelligence/projectIntelligenceTypes';
import { IEngineeringDecisionReport } from '../engineeringDecision/engineeringDecisionTypes';
import { IArchitectureBlueprint } from '../architecture/architectureTypes';
import { IWorkspaceBlueprint } from '../workspace/workspaceTypes';
import { IProjectManifestObject } from '../projectManifest/projectManifestTypes';
import { IGenerationPlanObject } from '../planner/plannerTypes';

export type GeneratorSDKStage =
  | 'GENERATOR_REGISTRATION'
  | 'GENERATOR_INITIALIZATION'
  | 'GENERATOR_EXECUTION'
  | 'VALIDATION'
  | 'FINALIZATION'
  | 'ROLLBACK'
  | 'COMPLETION';

export interface IGeneratorSDKLog {
  readonly stage: GeneratorSDKStage;
  readonly timestamp: number;
  readonly status: 'SUCCESS' | 'WARNING' | 'FAILED';
  readonly message: string;
  readonly details: Record<string, any>;
}

export interface IGeneratorExecutionContext {
  readonly requestId: string;
  readonly sessionId: string;
  readonly requirementObject?: IRequirementObject;
  readonly projectIntelligenceReport?: IProjectIntelligenceReport;
  readonly engineeringDecisionReport?: IEngineeringDecisionReport;
  readonly architectureBlueprint?: IArchitectureBlueprint;
  readonly workspaceBlueprint?: IWorkspaceBlueprint;
  readonly projectManifest?: IProjectManifestObject;
  readonly generationPlan?: IGenerationPlanObject;
  readonly customPayload?: Record<string, any>;
}

export interface IGeneratorExecutionResult {
  readonly generatorId: string;
  readonly success: boolean;
  readonly generatedArtifacts: readonly string[];
  readonly executionTimeMs: number;
  readonly validationPassed: boolean;
  readonly errors?: readonly string[];
}

export interface IGeneratorSDKResult {
  readonly requestId: string;
  readonly sessionId: string;
  readonly success: boolean;
  readonly generatorResults: readonly IGeneratorExecutionResult[];
  readonly totalArtifactsCount: number;
  readonly executionTimeMs: number;
}
