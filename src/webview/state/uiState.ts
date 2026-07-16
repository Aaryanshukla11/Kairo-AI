export interface UiState {
  sidebarWidth: number;
  activePanel: 'chat' | 'history' | 'settings';
  themeOverrides: Record<string, string>;
}

export const initialUiState: UiState = {
  sidebarWidth: 300,
  activePanel: 'chat',
  themeOverrides: {},
};
