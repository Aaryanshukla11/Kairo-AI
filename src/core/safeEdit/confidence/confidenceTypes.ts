export interface ConfidenceEvidence {
  factor: string;
  score: number; // 0.0 - 1.0
  description: string;
}

export interface ExecutionConfidenceReport {
  overallConfidence: number; // 0.0 - 1.0
  evidence: ConfidenceEvidence[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendation: string;
}
