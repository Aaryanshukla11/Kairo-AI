export type DependencyCategory =
  | 'Structural'
  | 'Logical'
  | 'Resource'
  | 'Temporal'
  | 'Policy'
  | 'Security'
  | 'Approval';

export interface CategorizedDependency {
  fromTaskId: string;
  toTaskId: string;
  category: DependencyCategory;
  description: string;
}
