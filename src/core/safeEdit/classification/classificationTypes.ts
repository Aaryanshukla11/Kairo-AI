export type PatchType =
  | 'Feature'
  | 'Bug Fix'
  | 'Refactor'
  | 'Documentation'
  | 'Formatting'
  | 'Infrastructure'
  | 'Configuration'
  | 'Dependency'
  | 'Migration'
  | 'Security'
  | 'Hotfix'
  | 'Experimental';

export interface PatchClassificationReport {
  primaryType: PatchType;
  confidence: number;
  tags: string[];
}
