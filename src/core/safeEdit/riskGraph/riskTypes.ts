export interface CategoryRisk {
  score: number;      // 0 - 100
  confidence: number; // 0.0 - 1.0
  severity: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  evidence: string[];
}

export interface RiskGraphData {
  categories: {
    filesystem: CategoryRisk;
    architecture: CategoryRisk;
    security: CategoryRisk;
    dependency: CategoryRisk;
    workspace: CategoryRisk;
    terminal: CategoryRisk;
    policy: CategoryRisk;
    rollback: CategoryRisk;
    approval: CategoryRisk;
  };
  overallRiskScore: number;
  overallRiskLevel: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical';
  overallConfidence: number;
}
