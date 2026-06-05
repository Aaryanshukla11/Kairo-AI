export interface ReleaseQualityGate {
  architecturePassed: boolean;
  runtimePassed: boolean;
  trainingPassed: boolean;
  inferencePassed: boolean;
  securityPassed: boolean;
  documentationPassed: boolean;
  performancePassed: boolean;
  compatibilityPassed: boolean;
  developerExperiencePassed: boolean;
}

export interface ReleaseHealthReport {
  overallScore: number;
  architectureHealth: number;
  runtimeHealth: number;
  trainingHealth: number;
  datasetHealth: number;
  inferenceHealth: number;
  memoryHealth: number;
  securityHealth: number;
  documentationHealth: number;
  developerExperienceHealth: number;
  recommendations: string[];
}

export interface DogfoodingRunResult {
  runId: string;
  timestamp: number;
  featureRequest: string;
  planningPassed: boolean;
  codeGenerated: boolean;
  testsExecuted: boolean;
  failuresFixed: boolean;
  patchProduced: boolean;
  safeEditPassed: boolean;
  patchContent: string;
  reportGenerated: boolean;
  validationIssues: string[];
}

export interface ReleaseManifestModel {
  version: string;
  timestamp: number;
  environment: string;
  qualityGate: ReleaseQualityGate;
  healthReport: ReleaseHealthReport;
  packagedFiles: string[];
  dependencyMap: Record<string, string>;
  checksums: Record<string, string>;
}

export interface IReleaseValidationProvider {
  readonly id: string;
  readonly name: string;
  readonly targetSubsystem: string;
  validate(version: string): Promise<{
    score: number;
    passed: boolean;
    issues: string[];
  }>;
}
