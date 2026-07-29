export interface EditOperation {
  type: 'insert' | 'replace' | 'delete' | 'move' | 'rename' | 'extract' | 'inline' | 'reorder';
  range: { start: number; end: number };
  text: string;
}

export interface IncrementalEditPlan {
  editId: string;
  targetFile: string;
  editRegions: { start: number; end: number }[];
  patchOperations: EditOperation[];
  preservedRegions: { start: number; end: number }[];
  validationSummary: {
    isValid: boolean;
    errors: string[];
  };
  warnings: string[];
  metrics: {
    originalSize: number;
    patchSize: number;
    preservedRatio: number;
  };
}

export enum EditEventType {
  EditPlanningStarted = 'EditPlanningStarted',
  RegionDetected = 'RegionDetected',
  PatchGenerated = 'PatchGenerated',
  ConflictDetected = 'ConflictDetected',
  PatchValidated = 'PatchValidated',
  IncrementalEditCompleted = 'IncrementalEditCompleted'
}

export interface EditEvent {
  type: EditEventType;
  timestamp: number;
  payload?: any;
}

export type EditEventListener = (event: EditEvent) => void;
