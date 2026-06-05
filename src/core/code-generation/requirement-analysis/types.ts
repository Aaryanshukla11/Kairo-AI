export interface ExtractedFields {
  projectName?: string;
  projectType?: string;
  domain?: string;
  targetUsers?: string[];
  businessGoal?: string;
  mainFeatures?: string[];
  optionalFeatures?: string[];
  authentication?: string;
  authorization?: string;
  databasePreference?: string;
  frontendPreference?: string;
  backendPreference?: string;
  architecturePreference?: string;
  deploymentPreference?: string;
  performanceRequirements?: string[];
  securityRequirements?: string[];
  accessibilityRequirements?: string[];
  responsiveRequirements?: string[];
  offlineSupport?: boolean;
  testingRequirements?: string[];
  documentationRequirements?: string[];
  isExistingProject?: boolean;
  modificationType?: 'full' | 'modification';
  targetPlatform?: string;
  programmingLanguagePreference?: string;
  frameworkPreference?: string;
  packageManager?: string;
  buildTool?: string;
  themePreference?: string;
  uiStyle?: string;
  thirdPartyIntegrations?: string[];
  externalApis?: string[];
  constraints?: string[];
  deadlines?: string;
  customInstructions?: string[];
}

export interface ConfidenceScores {
  projectType: number; // 0 to 100
  databasePreference: number;
  frontendPreference: number;
  backendPreference: number;
  authentication: number;
  deploymentPreference: number;
  programmingLanguagePreference: number;
}

export interface ClarificationQuestion {
  field: keyof ExtractedFields;
  question: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  options?: string[];
}

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conflictingTech: string[];
}

export interface RequirementObject {
  readonly originalPrompt: string;
  readonly normalizedPrompt: string;
  readonly metadata: {
    timestamp: number;
    analyzerVersion: string;
  };
  readonly detectedValues: ExtractedFields;
  readonly confidenceScores: ConfidenceScores;
  readonly unresolvedFields: readonly string[];
  readonly clarificationQuestions: readonly ClarificationQuestion[];
  readonly validationReport: ValidationReport;
  readonly strategyHints: {
    readonly generationStrategy: 'full_project' | 'file_modification' | 'api_only';
    readonly generatorHints: readonly string[];
    readonly plannerHints: readonly string[];
  };
}

