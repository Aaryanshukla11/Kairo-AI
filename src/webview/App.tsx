import React from "react";
import { ChatHeader } from "./components/chat/ChatHeader";
import { ChatTimeline } from "./components/chat/ChatTimeline";
import { PromptComposer } from "./components/composer/PromptComposer";

/**
 * Main application React entry container composing the chat shell layout.
 */
export function App(): React.JSX.Element {
  return (
    <div className="chat-layout">
      <ChatHeader />
      <ChatTimeline />
      <PromptComposer />
    </div>
  );
}
