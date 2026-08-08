import React, { useState } from "react";
import { ChatHeader } from "./components/chat/ChatHeader";
import { ChatTimeline } from "./components/chat/ChatTimeline";
import { ReviewChangesBar } from "./components/chat/ReviewChangesBar";
import { PromptComposer } from "./components/composer/PromptComposer";
import { PlatformValidationDashboard } from "./components/platformValidation/PlatformValidationDashboard";
import { RuntimeValidationDashboard } from "./components/platformValidation/RuntimeValidationDashboard";
import { ReleaseDashboard } from "./components/platformValidation/ReleaseDashboard";
import { ProjectGeneratorDashboard } from "./components/runtime/ProjectGeneratorDashboard";

/**
 * Main application React entry container composing the chat shell layout.
 */
export function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<'chat' | 'platform' | 'runtime' | 'release' | 'generator'>('chat');

  return (
    <div className="chat-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#121212' }}>
      <ChatHeader currentView={currentView as any} setCurrentView={setCurrentView as any} />
      
      {/* Sub-header view switcher tab row */}
      <div style={styles.subHeaderTabs}>
        <button 
          style={currentView === 'chat' ? styles.activeTab : styles.tab} 
          onClick={() => setCurrentView('chat')}
        >
          Chat
        </button>
        <button 
          style={currentView === 'platform' ? styles.activeTab : styles.tab} 
          onClick={() => setCurrentView('platform')}
        >
          Platform Health
        </button>
        <button 
          style={currentView === 'runtime' ? styles.activeTab : styles.tab} 
          onClick={() => setCurrentView('runtime')}
        >
          Runtime Verification
        </button>
        <button 
          style={currentView === 'release' ? styles.activeTab : styles.tab} 
          onClick={() => setCurrentView('release')}
        >
          Release RC1
        </button>
        <button 
          style={currentView === 'generator' ? styles.activeTab : styles.tab} 
          onClick={() => setCurrentView('generator')}
        >
          Project Generator
        </button>
      </div>
      
      {currentView === 'chat' ? (
        <>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <ChatTimeline />
          </div>
          <ReviewChangesBar />
          <PromptComposer />
        </>
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
  subHeaderTabs: {
    display: 'flex',
    backgroundColor: '#181818',
    borderBottom: '1px solid #2d2d2d',
    padding: '4px 12px',
    gap: '6px',
    flexShrink: 0
  },
  tab: {
    background: 'none',
    border: 'none',
    color: '#8c8c8c',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 'bold' as 'bold',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
    '&:hover': {
      color: '#cccccc',
      backgroundColor: '#2d2d2d'
    }
  },
  activeTab: {
    background: '#2d2d2d',
    border: '1px solid #3c3c3c',
    color: '#10b981',
    padding: '3px 9px',
    fontSize: '11px',
    fontWeight: 'bold' as 'bold',
    cursor: 'pointer',
    borderRadius: '4px'
  }
};
