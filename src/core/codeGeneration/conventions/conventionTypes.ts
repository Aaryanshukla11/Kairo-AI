export interface ConventionProfile {
  projectId: string;
  namingRules: { casing: 'camelCase' | 'snakeCase' | 'PascalCase'; confidence: number };
  folderRules: { path: string; convention: string }[];
  importRules: { style: 'relative' | 'absolute' | 'alias'; confidence: number };
  architectureRules: { layersCheck: boolean; constraintRule: string }[];
  formattingRules: { useTabs: boolean; tabSize: number };
  codeStyleRules: { allowAny: boolean; strictNulls: boolean };
  confidence: number; // overall calculated confidence index (0.0 to 1.0)
}

export enum ConventionEventType {
  ConventionScanStarted = 'ConventionScanStarted',
  PatternDetected = 'PatternDetected',
  ConventionLearned = 'ConventionLearned',
  ProfileGenerated = 'ProfileGenerated',
  ConventionValidated = 'ConventionValidated',
  ConventionReady = 'ConventionReady'
}

export interface ConventionEvent {
  type: ConventionEventType;
  timestamp: number;
  payload?: any;
}

export type ConventionEventListener = (event: ConventionEvent) => void;
export type RuleCategory = 'naming' | 'folder' | 'import' | 'formatting' | 'codestyle';
