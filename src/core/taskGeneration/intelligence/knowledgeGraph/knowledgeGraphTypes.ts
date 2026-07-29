export interface TaskKnowledgeMetadata {
  taskId: string;
  requiredFiles: string[];
  producedFiles: string[];
  requiredSymbols: string[];
  producedSymbols: string[];
  apis: string[];
  services: string[];
  components: string[];
  databaseTables: string[];
  dependencies: string[];
  risk: string;
  confidence: number;
}
