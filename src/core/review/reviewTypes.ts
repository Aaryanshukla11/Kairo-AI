export interface ReviewIssue {
  ruleId: string;
  message: string;
  severity: 'Info' | 'Suggestion' | 'Warning' | 'Error' | 'Critical';
  category: string;
}

export interface SelfReviewReport {
  overallScore: number;
  confidence: number;
  passedChecks: string[];
  failedChecks: string[];
  warnings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  reviewSummary: string;
}

export enum ReviewEventType {
  ReviewStarted = 'ReviewStarted',
  RuleExecuted = 'RuleExecuted',
  IssueDetected = 'IssueDetected',
  ScoreCalculated = 'ScoreCalculated',
  ReviewCompleted = 'ReviewCompleted',
  ReviewApproved = 'ReviewApproved'
}

export interface ReviewEvent {
  type: ReviewEventType;
  timestamp: number;
  payload?: any;
}

export type ReviewEventListener = (event: ReviewEvent) => void;
