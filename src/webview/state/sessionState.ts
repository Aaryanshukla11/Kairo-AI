import { useState, useCallback, useEffect } from 'react';
import { Session } from '../../common/session';
import { sessionService } from '../services/sessionService';

// Note: As per AIIdle constraints, no 3rd party state managers are used.
// We provide a robust custom React hook leveraging local state and the message bus.

export function useSessionState() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Future bindings to listen to MessageBus 'SESSION_EVENT' IPC broadcasts

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return {
    sessions,
    currentSession,
    currentSessionId,
    isLoading,
    setSessions,
    setCurrentSessionId,
    setIsLoading
  };
}
