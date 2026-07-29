export enum MemoryType {
  ArchitectureDecision = 'Architecture Decision',
  ImplementationHistory = 'Implementation History',
  ExecutionSummary = 'Execution Summary',
  BugHistory = 'Bug History',
  RefactoringHistory = 'Refactoring History',
  WorkspaceInsight = 'Workspace Insight',
  DependencyInsight = 'Dependency Insight',
  CodingPreference = 'Coding Preference',
  ProjectConvention = 'Project Convention'
}

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  summary: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  importance: number; // 1-10
  relevanceScore?: number; // 0.0 - 1.0
  tags: string[];
  relatedFiles: string[];
  relatedTasks: string[];
  relatedCommits: string[];
}

export interface MemoryFilter {
  query?: string;
  type?: MemoryType;
  tags?: string[];
  importanceMin?: number;
}

export enum MemoryEventType {
  MemoryCreated = 'MemoryCreated',
  MemoryUpdated = 'MemoryUpdated',
  MemoryRetrieved = 'MemoryRetrieved',
  MemoryCompressed = 'MemoryCompressed',
  MemoryArchived = 'MemoryArchived',
  MemoryDeleted = 'MemoryDeleted'
}

export interface MemoryEvent {
  type: MemoryEventType;
  timestamp: number;
  payload?: any;
}

export type MemoryEventListener = (event: MemoryEvent) => void;
