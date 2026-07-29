import React, { useState } from "react";
import { ChatHeader } from "./components/chat/ChatHeader";
import { ChatTimeline } from "./components/chat/ChatTimeline";
import { PromptComposer } from "./components/composer/PromptComposer";
import { TerminalConsole } from "./components/terminal/TerminalConsole";

/**
 * Main application React entry container composing the chat shell layout.
 */
export function App(): React.JSX.Element {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <div className="chat-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <ChatHeader />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <ChatTimeline />
      </div>
      <PromptComposer />
      <TerminalConsole 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        onOpen={() => setIsTerminalOpen(true)} 
      />
    </div>
  );
}
