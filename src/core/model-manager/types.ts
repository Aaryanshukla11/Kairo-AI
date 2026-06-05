export interface ActiveModel {
  id: string;
  displayName: string;
  provider: string;
  runtime: string;
  local: boolean;
  status: 'loading' | 'ready' | 'busy' | 'offline';
  contextWindow: number;
  maxOutputTokens: number;
}

export interface ModelInfo {
  id: string;
  displayName: string;
  provider: string;
  runtime: string;
  local: boolean;
  contextWindow: number;
  maxOutputTokens: number;
  installed: boolean;
  description?: string;
}

export interface ModelManagerStatusPayload {
  activeModel: ActiveModel;
  installedModels: ModelInfo[];
  timestamp: number;
}
