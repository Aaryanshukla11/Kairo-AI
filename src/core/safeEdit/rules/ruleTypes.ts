export interface SafeRule {
  ruleId: string;
  name: string;
  category: 'Filesystem' | 'Architecture' | 'Security' | 'Dependency' | 'Workspace' | 'Terminal' | 'Policy' | 'Rollback' | 'Approval';
  severity: 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  supportedLanguages: string[];
  supportedProviders: string[];
  executionStage: 'Pre-Execution' | 'In-Flight' | 'Post-Execution';
  enabled: boolean;
  validate(patchContent: string, context: any): { valid: boolean; error?: string };
}
