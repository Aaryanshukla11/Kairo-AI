export enum TimelineStepStatus {
  Waiting = 'Waiting',
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Skipped = 'Skipped'
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: TimelineStepStatus;
  stepNumber: number;
  estimatedTime: string;
  icon: string;
}

export interface Timeline {
  id: string;
  planId: string;
  steps: TimelineStep[];
}
