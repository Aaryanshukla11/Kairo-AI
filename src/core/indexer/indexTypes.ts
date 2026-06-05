export enum SymbolType {
  Class = 'Class',
  Interface = 'Interface',
  Function = 'Function',
  Method = 'Method',
  Variable = 'Variable',
  Constant = 'Constant',
  Enum = 'Enum',
  Type = 'Type',
  Component = 'Component',
  Hook = 'Hook',
  ApiRoute = 'ApiRoute'
}

export interface WorkspaceSymbol {
  name: string;
  type: SymbolType;
  filePath: string;
  line: number;
}

export interface IndexedFile {
  filePath: string;
  language: string;
  size: number;
}

export interface IndexedFolder {
  folderPath: string;
  filesCount: number;
}

export interface FileDependency {
  sourceFilePath: string;
  targetFilePath: string;
  type: 'Import' | 'Requires' | 'Extends';
}

export interface ProjectIndex {
  id: string;
  workspaceId: string;
  files: IndexedFile[];
  folders: IndexedFolder[];
  symbols: WorkspaceSymbol[];
  dependencies: FileDependency[];
  framework: string;
  language: string;
  updatedAt: number;
}

export enum IndexEventType {
  IndexStarted = 'IndexStarted',
  FileIndexed = 'FileIndexed',
  SymbolIndexed = 'SymbolIndexed',
  IndexCompleted = 'IndexCompleted',
  IndexUpdated = 'IndexUpdated'
}

export interface IndexEvent {
  type: IndexEventType;
  payload?: any;
  timestamp: number;
}

export type IndexEventListener = (event: IndexEvent) => void;
