export enum CodeSmell {
  LongMethod = 'Long Method',
  LargeClass = 'Large Class',
  DuplicateCode = 'Duplicate Code',
  DeepNesting = 'Deep Nesting',
  DeadCode = 'Dead Code',
  GodObject = 'God Object',
  MagicNumbers = 'Magic Numbers',
  UnusedImports = 'Unused Imports',
  CircularDependencies = 'Circular Dependencies'
}

export enum RefactoringType {
  RenameSymbols = 'Rename Symbols',
  ExtractMethod = 'Extract Method',
  ExtractClass = 'Extract Class',
  MoveFile = 'Move File',
  MoveModule = 'Move Module',
  SplitComponents = 'Split Components',
  MergeDuplicates = 'Merge Duplicates',
  SimplifyLogic = 'Simplify Logic',
  DependencyCleanup = 'Dependency Cleanup',
  FolderRestructure = 'Folder Restructure'
}

export interface RefactorPlan {
  planId: string;
  targetFile: string;
  type: RefactoringType;
  smell: CodeSmell;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
}

export interface RefactorReport {
  refactoringId: string;
  detectedIssues: { smell: CodeSmell; file: string; description: string; line?: number }[];
  suggestedImprovements: string[];
  estimatedComplexity: 'Low' | 'Medium' | 'High';
  affectedFiles: string[];
  behaviorRisk: 'None' | 'Low' | 'Medium' | 'High';
  maintainabilityGain: number; // 0 - 100
}

export enum RefactorEventType {
  AnalysisStarted = 'AnalysisStarted',
  CodeSmellDetected = 'CodeSmellDetected',
  RefactoringPlanned = 'RefactoringPlanned',
  ValidationPassed = 'ValidationPassed',
  RefactoringCompleted = 'RefactoringCompleted'
}

export interface RefactorEvent {
  type: RefactorEventType;
  timestamp: number;
  payload?: any;
}

export type RefactorEventListener = (event: RefactorEvent) => void;
