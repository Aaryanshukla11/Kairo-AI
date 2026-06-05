import { PatchType } from './classificationTypes';

export interface ClassifierRule {
  type: PatchType;
  keywords: string[];
  weight: number;
}

export const classifierRules: ClassifierRule[] = [
  { type: 'Bug Fix', keywords: ['fix', 'bug', 'issue', 'resolve', 'error', 'crash'], weight: 2.0 },
  { type: 'Feature', keywords: ['feat', 'feature', 'add', 'implement', 'new'], weight: 1.5 },
  { type: 'Refactor', keywords: ['refactor', 'clean', 'restructure', 'cleanup'], weight: 1.8 },
  { type: 'Documentation', keywords: ['docs', 'readme', 'comment', 'docstring', 'guide'], weight: 2.2 },
  { type: 'Dependency', keywords: ['package.json', 'dependencies', 'npm', 'yarn', 'import'], weight: 2.0 },
  { type: 'Security', keywords: ['security', 'password', 'secret', 'auth', 'token', 'crypt'], weight: 2.5 }
];
