import React, { createContext, useContext } from 'react';
import { AppState, initialAppState } from '../state/appState';
import { UiState, initialUiState } from '../state/uiState';
import { ChatState, initialChatState } from '../state/chatState';

export interface AppContextType {
  appState: AppState;
  uiState: UiState;
  chatState: ChatState;
}

export const initialAppContext: AppContextType = {
  appState: initialAppState,
  uiState: initialUiState,
  chatState: initialChatState,
};

export const AppContext = createContext<AppContextType>(initialAppContext);

export function useAppContext(): AppContextType {
  return useContext(AppContext);
}
