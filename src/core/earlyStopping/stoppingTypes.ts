export type StoppingDecisionType =
  | 'continue'
  | 'pause'
  | 'checkpoint_and_continue'
  | 'stop'
  | 'require_manual_review';

export interface StoppingPolicyConfig {
  metric: 'validationLoss' | 'trainingLoss' | 'accuracy' | 'perplexity' | 'compositeScore' | 'custom';
  threshold?: number;
  minImprovement?: number;
  patienceWindow: number;
  mode: 'min' | 'max';
  customPolicyName?: string;
}

export interface StoppingDecision {
  decision: StoppingDecisionType;
  reason: string;
  timestamp: number;
  evaluatedMetricValue: number;
  bestMetricValue: number;
  stepsSinceImprovement: number;
}

export interface PatienceReport {
  patienceWindow: number;
  improvementCount: number;
  plateauLength: number;
  metricStability: number; // variance or standard deviation
  bestScore: number;
  lastImprovementStep: number;
}

export interface RecommendationReport {
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0 to 1
  reasoning: string[];
  suggestedAction: string;
}

export interface StoppingReportModel {
  reportId: string;
  sessionId: string;
  decision: StoppingDecision;
  patienceReport: PatienceReport;
  recommendationReport: RecommendationReport;
  createdAt: number;
}

export interface StoppingManifest {
  reportId: string;
  checksum: string; // sha256 checksum of compiled stopping report
  timestamp: number;
}

export enum EarlyStoppingEventType {
  IngestMetrics = 'IngestMetrics',
  MetricsValidated = 'MetricsValidated',
  PoliciesEvaluated = 'PoliciesEvaluated',
  TrendsAnalyzed = 'TrendsAnalyzed',
  PatienceChecked = 'PatienceChecked',
  DecisionGenerated = 'DecisionGenerated',
  ReportsPublished = 'ReportsPublished',
  TrainingStateUpdated = 'TrainingStateUpdated'
}

export interface EarlyStoppingEvent {
  type: EarlyStoppingEventType;
  timestamp: number;
  sessionId: string;
  payload: any;
}

export type EarlyStoppingEventListener = (event: EarlyStoppingEvent) => void;
