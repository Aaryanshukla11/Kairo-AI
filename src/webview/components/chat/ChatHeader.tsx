import React from 'react';
import { StatusBadge } from './StatusBadge';

export function ChatHeader(): React.JSX.Element {
  return (
    <header className="chat-header">
      <div className="chat-header-identity">
        <h1 className="chat-header-title h1">Sasta-Antigravity</h1>
        <span className="chat-header-subtitle caption">Offline AI Software Engineer</span>
        <span className="chat-header-workspace caption">Workspace Ready</span>
      </div>
      <StatusBadge label="Ready" status="ready" />
    </header>
  );
}
