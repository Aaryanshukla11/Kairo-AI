import React from "react";
import { Header } from "./Header";
import { ConversationPanel } from "./ConversationPanel";
import { PromptPanel } from "./PromptPanel";

/**
 * MainLayout component integrating Header, Conversation streams, and Prompt inputs.
 */
export function MainLayout(): React.JSX.Element {
  return (
    <div className="main-layout">
      <Header />
      <ConversationPanel />
      <PromptPanel />
    </div>
  );
}
export default MainLayout;
