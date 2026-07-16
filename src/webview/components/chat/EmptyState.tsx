import React from 'react';

export function EmptyState(): React.JSX.Element {
  return (
    <div className="chat-empty-state">
      <h2 className="chat-empty-title display">Welcome to Sasta-Antigravity</h2>
      <p className="chat-empty-subtitle h2">Your Offline AI Software Engineer</p>
      
      <ul className="chat-empty-features">
        <li className="body">• Create complete applications</li>
        <li className="body">• Modify existing projects</li>
        <li className="body">• Refactor production code</li>
        <li className="body">• Generate documentation</li>
        <li className="body">• Explain unfamiliar code</li>
      </ul>
      
      <p className="chat-empty-footer caption">Everything runs locally.</p>
    </div>
  );
}
