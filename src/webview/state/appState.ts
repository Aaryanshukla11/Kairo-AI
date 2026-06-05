export interface AppState {
  version: string;
  isInitialized: boolean;
  workspaceStatus: 'ready' | 'loading' | 'error' | 'offline';
}

export const initialAppState: AppState = {
  version: '1.0.0',
  isInitialized: false,
  workspaceStatus: 'offline',
};
