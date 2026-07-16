import React, { useState } from 'react';
import { AppContext, AppContextType, initialAppContext } from '../context/AppContext';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps): React.JSX.Element {
  const [contextValue] = useState<AppContextType>(initialAppContext);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
