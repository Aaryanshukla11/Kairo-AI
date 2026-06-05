export interface ASTNode {
  type: string; // e.g. 'Program', 'ClassDeclaration', 'FunctionDeclaration', 'ImportDeclaration'
  name?: string;
  value?: string;
  children?: ASTNode[];
  start?: number;
  end?: number;
}

export interface ASTArtifact {
  astId: string;
  language: 'typescript' | 'javascript' | 'python';
  rootNode: ASTNode;
  symbols: { name: string; type: 'class' | 'interface' | 'function' | 'variable' }[];
  imports: string[];
  exports: string[];
  diagnostics: string[];
  metadata: {
    nodesCount: number;
    depth: number;
    optimized: boolean;
  };
}

export enum ASTEventType {
  ASTGenerationStarted = 'ASTGenerationStarted',
  ProviderSelected = 'ProviderSelected',
  ASTCreated = 'ASTCreated',
  ASTValidated = 'ASTValidated',
  ASTOptimized = 'ASTOptimized',
  ASTSerialized = 'ASTSerialized',
  GenerationCompleted = 'GenerationCompleted'
}

export interface ASTEvent {
  type: ASTEventType;
  timestamp: number;
  payload?: any;
}

export type ASTEventListener = (event: ASTEvent) => void;
