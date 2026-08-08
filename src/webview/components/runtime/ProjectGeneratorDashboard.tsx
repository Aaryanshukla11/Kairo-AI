import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType } from '../../../common/protocol';

export function ProjectGeneratorDashboard(): React.JSX.Element {
  const [prompt, setPrompt] = useState('Build a Hospital Management System using React, FastAPI, PostgreSQL, JWT Authentication and Docker.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'database' | 'config' | 'docs' | 'tests' | 'blueprint'>('blueprint');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (msg: any) => {
      if (msg.type === MessageType.GENERATION_UPDATE && msg.payload) {
        setResult(msg.payload.project);
        setLoading(false);
        if (msg.payload.project?.files) {
          const firstFile = Object.keys(msg.payload.project.files)[0];
          setSelectedFile(firstFile);
        }
      }
    };
    vscodeBridge.subscribe(MessageType.GENERATION_UPDATE, handleMessage);
    return () => {
      vscodeBridge.unsubscribe(MessageType.GENERATION_UPDATE, handleMessage);
    };
  }, []);

  const triggerGeneration = () => {
    setLoading(true);
    vscodeBridge.postMessage({
      type: MessageType.GENERATION_REQUEST,
      payload: { action: 'generate_project', prompt }
    });
  };

  const checkFileContent = (path: string) => {
    if (result?.files && result.files[path]) {
      return result.files[path];
    }
    return 'File content not found.';
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Phase 9: Code Generation Factory</h2>
          <p style={styles.subtitle}>Convert natural language prompts into complete deployable production software projects</p>
        </div>
      </header>

      {/* Input panel */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Project Generation Prompt</h3>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={styles.promptInput}
          placeholder="Describe what you want to build (e.g. Build an Ecommerce site using React, Express, MySQL...)"
          disabled={loading}
        />
        <button 
          onClick={triggerGeneration} 
          disabled={loading || !prompt.trim()} 
          style={styles.primaryButton}
        >
          {loading ? 'Executing 14-stage Generation Pipeline...' : 'Generate Project Blueprint & Codebases'}
        </button>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <div style={{ marginTop: '15px', color: '#888' }}>
            Running requirement analysis, tech recommendation, layered routing setups, db migrations, and compiling testing files...
          </div>
        </div>
      )}

      {result && !loading && (
        <div style={styles.grid2}>
          {/* Metadata, recommendations, and blueprint */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Classifications Card */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Pipeline Recommendations</h3>
              <div style={styles.badgeRow}>
                <div style={styles.badgeCol}>
                  <span style={styles.badgeLabel}>Project Type</span>
                  <span style={styles.badgeValue}>{result.requirements?.projectType}</span>
                </div>
                <div style={styles.badgeCol}>
                  <span style={styles.badgeLabel}>Domain</span>
                  <span style={styles.badgeValue}>{result.requirements?.domain}</span>
                </div>
                <div style={styles.badgeCol}>
                  <span style={styles.badgeLabel}>Database</span>
                  <span style={styles.badgeValue}>{result.stack?.database}</span>
                </div>
                <div style={styles.badgeCol}>
                  <span style={styles.badgeLabel}>Authentication</span>
                  <span style={styles.badgeValue}>{result.stack?.authentication}</span>
                </div>
              </div>
            </div>

            {/* Folder structure mapping */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Folder Architecture</h3>
              <pre style={styles.treeBlock}>
                {result.blueprint?.directoryTree}
              </pre>
            </div>

            {/* Pipeline Step logs */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Pipeline Step Executions</h3>
              <div style={styles.logList}>
                {result.logs && result.logs.map((log: string, idx: number) => (
                  <div key={idx} style={styles.logRow}>
                    <span style={{ color: '#10b981', marginRight: '6px' }}>✔</span>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Inspection panel */}
          <div style={styles.card}>
            <div style={styles.tabsContainer}>
              <button 
                style={activeTab === 'blueprint' ? styles.activeTab : styles.tab} 
                onClick={() => { setActiveTab('blueprint'); setSelectedFile(null); }}
              >
                Blueprint Details
              </button>
              <button 
                style={activeTab === 'frontend' ? styles.activeTab : styles.tab} 
                onClick={() => { setActiveTab('frontend'); setSelectedFile('frontend/src/App.tsx'); }}
              >
                Frontend React
              </button>
              <button 
                style={activeTab === 'backend' ? styles.activeTab : styles.tab} 
                onClick={() => { setActiveTab('backend'); setSelectedFile(result.stack.backend === 'FastAPI' ? 'backend/app/main.py' : 'backend/src/server.ts'); }}
              >
                Backend API
              </button>
              <button 
                style={activeTab === 'database' ? styles.activeTab : styles.tab} 
                onClick={() => { setActiveTab('database'); setSelectedFile('database/schema.sql'); }}
              >
                Database Schema
              </button>
              <button 
                style={activeTab === 'config' ? styles.activeTab : styles.tab} 
                onClick={() => { setActiveTab('config'); setSelectedFile('docker-compose.yml'); }}
              >
                Configs
              </button>
              <button 
                style={activeTab === 'docs' ? styles.activeTab : styles.tab} 
                onClick={() => { setActiveTab('docs'); setSelectedFile('README.md'); }}
              >
                Docs
              </button>
            </div>

            {/* Tab: Blueprint Details */}
            {activeTab === 'blueprint' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <strong>Package Dependencies:</strong>
                  <pre style={styles.codeBlock}>
                    {JSON.stringify(result.blueprint?.dependencies, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>Environment Configurations (.env):</strong>
                  <pre style={styles.codeBlock}>
                    {JSON.stringify(result.blueprint?.envVariables, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Code browser for source files */}
            {activeTab !== 'blueprint' && selectedFile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888' }}>
                  <span>File browser path:</span>
                  <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>{selectedFile}</span>
                </div>
                <pre style={styles.codeBlock}>
                  {checkFileContent(selectedFile)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#121212',
    color: '#e0e0e0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    minHeight: '100vh',
    overflowY: 'auto' as 'auto'
  },
  header: {
    borderBottom: '1px solid #2d2d2d',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    margin: '5px 0 0 0',
    color: '#888',
    fontSize: '0.95rem'
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    border: '1px solid #2d2d2d',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    marginTop: 0,
    marginBottom: '15px',
    color: '#f3f4f6',
    borderBottom: '1px solid #2d2d2d',
    paddingBottom: '8px'
  },
  promptInput: {
    width: '100%',
    height: '70px',
    backgroundColor: '#151515',
    border: '1px solid #2d2d2d',
    borderRadius: '4px',
    color: '#e0e0e0',
    padding: '10px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'none' as 'none',
    outline: 'none',
    marginBottom: '15px'
  },
  primaryButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#059669'
    }
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px'
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    gap: '12px'
  },
  badgeCol: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    backgroundColor: '#151515',
    border: '1px solid #2d2d2d',
    borderRadius: '6px',
    padding: '8px 12px',
    minWidth: '100px'
  },
  badgeLabel: {
    fontSize: '0.75em',
    color: '#888',
    textTransform: 'uppercase' as 'uppercase'
  },
  badgeValue: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: '2px'
  },
  treeBlock: {
    backgroundColor: '#0d0d0d',
    color: '#a78bfa',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '12.5px',
    fontFamily: 'monospace',
    overflowX: 'auto' as 'auto',
    margin: 0
  },
  codeBlock: {
    backgroundColor: '#0d0d0d',
    color: '#34d399',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '12.5px',
    fontFamily: 'monospace',
    overflowX: 'auto' as 'auto',
    margin: 0,
    whiteSpace: 'pre-wrap' as 'pre-wrap',
    maxHeight: '400px',
    overflowY: 'auto' as 'auto'
  },
  logList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '6px'
  },
  logRow: {
    display: 'flex',
    alignItems: 'center'
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '2px solid #2d2d2d',
    marginBottom: '20px',
    overflowX: 'auto' as 'auto'
  },
  tab: {
    background: 'none',
    border: 'none',
    color: '#888',
    padding: '10px 15px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as 'nowrap'
  },
  activeTab: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    padding: '10px 15px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    borderBottom: '2px solid #10b981',
    fontWeight: 'bold',
    whiteSpace: 'nowrap' as 'nowrap'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #2d2d2d',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};
export default ProjectGeneratorDashboard;
