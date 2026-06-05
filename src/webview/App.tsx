import React, { useState } from "react";
import { ChatHeader } from "./components/chat/ChatHeader";
import { ChatTimeline } from "./components/chat/ChatTimeline";
import { ReviewChangesBar } from "./components/chat/ReviewChangesBar";
import { PromptComposer } from "./components/composer/PromptComposer";
import { PlatformValidationDashboard } from "./components/platformValidation/PlatformValidationDashboard";
import { RuntimeValidationDashboard } from "./components/platformValidation/RuntimeValidationDashboard";
import { ReleaseDashboard } from "./components/platformValidation/ReleaseDashboard";
import { ProjectGeneratorDashboard } from "./components/runtime/ProjectGeneratorDashboard";
import { useAppContext } from "./context/AppContext";

/**
 * Main application React entry container composing the chat shell layout.
 */
export function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<'chat' | 'platform' | 'runtime' | 'release' | 'generator'>('chat');
  const { chatState } = useAppContext();

  return (
    <div className="chat-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#121212' }}>
      <ChatHeader currentView={currentView as any} setCurrentView={setCurrentView as any} />
      
      {currentView === 'chat' ? (
        chatState.messages.length === 0 ? (
          <div style={styles.landingContainer}>
            <div style={styles.landingContent}>
              <h2 style={styles.landingTitle}>Kairo-AI</h2>
              <PromptComposer isLandingPage={true} />
            </div>
            <footer style={styles.landingFooter}>
              AI may make mistakes. Double-check all generated code.
            </footer>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <ChatTimeline />
            </div>
            <ReviewChangesBar />
            <PromptComposer />
          </>
        )
      ) : currentView === 'platform' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <PlatformValidationDashboard />
        </div>
      ) : currentView === 'runtime' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <RuntimeValidationDashboard />
        </div>
      ) : currentView === 'release' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ReleaseDashboard />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ProjectGeneratorDashboard />
        </div>
      )}
    </div>
  );
}

const styles = {
  landingContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    backgroundColor: '#121212',
    color: '#ffffff',
    overflow: 'hidden',
    flex: 1
  },
  landingContent: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    width: '100%',
    maxWidth: '480px',
    padding: '0 24px',
    boxSizing: 'border-box' as 'border-box',
    marginTop: 'auto',
    marginBottom: 'auto',
    transform: 'translateY(-40px)'
  },
  landingTitle: {
    fontSize: '22px',
    fontWeight: 'bold' as 'bold',
    color: '#ffffff',
    margin: '0 0 16px 4px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  landingFooter: {
    fontSize: '11px',
    color: '#555555',
    textAlign: 'center' as 'center',
    paddingBottom: '16px',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    userSelect: 'none' as 'none'
  }
};
