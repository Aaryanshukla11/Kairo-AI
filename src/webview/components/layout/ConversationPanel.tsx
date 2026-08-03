import React from "react";

/**
 * ConversationPanel component housing the primary message stream welcome placeholder.
 */
export function ConversationPanel(): React.JSX.Element {
  return (
    <main className="conversation-panel">
      <h1 className="welcome-title">Welcome to Kaira AI</h1>
      <p className="welcome-description">Your Offline AI Software Engineer</p>
      
      <ul className="welcome-list">
        <li className="welcome-list-item">Create projects.</li>
        <li className="welcome-list-item">Modify existing code.</li>
        <li className="welcome-list-item">Generate production-ready applications.</li>
        <li className="welcome-list-item">Everything runs locally.</li>
      </ul>
    </main>
  );
}
export default ConversationPanel;
