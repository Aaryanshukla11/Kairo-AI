import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType } from '../../../common/protocol';

export function PlatformValidationDashboard(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'pipeline' | 'dependencies'>('overview');

  useEffect(() => {
    // Request latest validation results on load
    setLoading(true);
    vscodeBridge.postMessage({
      type: MessageType.VALIDATION_REQUEST,
      payload: { action: 'get_latest' }
    });

    const handleValidationUpdate = (msg: any) => {
      if (msg.type === MessageType.VALIDATION_UPDATE && msg.payload) {
        setData(msg.payload);
        setLoading(false);
      }
    };

    vscodeBridge.subscribe(MessageType.VALIDATION_UPDATE, handleValidationUpdate);

    return () => {
      vscodeBridge.unsubscribe(MessageType.VALIDATION_UPDATE, handleValidationUpdate);
    };
  }, []);

  const triggerRun = () => {
    setLoading(true);
    vscodeBridge.postMessage({
      type: MessageType.VALIDATION_REQUEST,
      payload: { action: 'run_validation' }
    });
  };

  if (loading && !data) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingText}>Running complete platform architecture and pipeline validation...</div>
      </div>
    );
  }

  const report = data?.report;
  const health = data?.health;

  if (!report) {
    return (
      <div style={styles.emptyContainer}>
        <h3>No Platform Validation Data Available</h3>
        <p>Run the validation engine to audit architecture contracts, module boundaries, events, and execute the integration pipeline.</p>
        <button onClick={triggerRun} style={styles.primaryButton}>Trigger Platform Validation</button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50'; // Green
    if (score >= 70) return '#ff9800'; // Amber
    return '#f44336'; // Red
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Passed' || status === 'Success') return '🟢';
    if (status === 'Warning') return '🟡';
    return '🔴';
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Platform Health & Stabilization Engine</h2>
          <p style={styles.subtitle}>Phase 8.5 — Integration & Architecture Audit</p>
        </div>
        <button onClick={triggerRun} disabled={loading} style={styles.primaryButton}>
          {loading ? 'Executing Validation...' : 'Run Audit Engine'}
        </button>
      </header>

      {/* Overview Cards */}
      <div style={styles.grid3}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>Overall Health Score</div>
          <div style={{ ...styles.largeScore, color: getScoreColor(report.overallHealthScore) }}>
            {report.overallHealthScore}%
          </div>
          <div style={styles.subtext}>
            Risk Level: <span style={{ fontWeight: 'bold' }}>{health?.riskLevel || 'Low'}</span> | Trend: <span style={{ fontWeight: 'bold' }}>{health?.trend || 'Stable'}</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>Architecture & Module Health</div>
          <div style={styles.scoreRow}>
            <div style={styles.scoreItem}>
              <div style={styles.scoreLabel}>Structure</div>
              <div style={{ ...styles.mediumScore, color: getScoreColor(report.scores.architecture) }}>{report.scores.architecture}%</div>
            </div>
            <div style={styles.scoreItem}>
              <div style={styles.scoreLabel}>Boundaries</div>
              <div style={{ ...styles.mediumScore, color: getScoreColor(report.scores.moduleHealth) }}>{report.scores.moduleHealth}%</div>
            </div>
            <div style={styles.scoreItem}>
              <div style={styles.scoreLabel}>Providers</div>
              <div style={{ ...styles.mediumScore, color: getScoreColor(report.scores.providerHealth) }}>{report.scores.providerHealth}%</div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>Integration Pipeline Status</div>
          <div style={{ ...styles.largeScore, color: report.pipelineStatus === 'Success' ? '#4caf50' : '#ff9800' }}>
            {report.pipelineStatus}
          </div>
          <div style={styles.subtext}>
            Passed {report.pipelineSteps.filter((s: any) => s.status === 'Success').length} / {report.pipelineSteps.length} stages
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button 
          style={viewMode === 'overview' ? styles.activeTab : styles.tab} 
          onClick={() => setViewMode('overview')}
        >
          Overview & Recommendations
        </button>
        <button 
          style={viewMode === 'pipeline' ? styles.activeTab : styles.tab} 
          onClick={() => setViewMode('pipeline')}
        >
          Integration Pipeline ({report.pipelineSteps.length} Stages)
        </button>
        <button 
          style={viewMode === 'dependencies' ? styles.activeTab : styles.tab} 
          onClick={() => setViewMode('dependencies')}
        >
          Dependency Graph & Cycles
        </button>
      </div>

      {/* Tab Content 1: Overview */}
      {viewMode === 'overview' && (
        <div style={styles.tabContent}>
          <div style={styles.grid2}>
            {/* Recommendations */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Recovery Recommendations</h3>
              <ul style={styles.list}>
                {report.recommendations.map((rec: string, i: number) => (
                  <li key={i} style={styles.listItem}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Subsystems Breakdown */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Subsystem Health Aggregates</h3>
              <div style={styles.subsystemList}>
                {health?.subsystems && Object.entries(health.subsystems).map(([name, info]: any) => (
                  <div 
                    key={name} 
                    onClick={() => setSelectedSubsystem(selectedSubsystem === name ? null : name)}
                    style={{ 
                      ...styles.subsystemRow, 
                      backgroundColor: selectedSubsystem === name ? 'rgba(255, 255, 255, 0.05)' : 'transparent' 
                    }}
                  >
                    <div style={styles.subsystemName}>
                      {getStatusIcon(info.status)} {name}
                    </div>
                    <div style={{ ...styles.subsystemScore, color: getScoreColor(info.score) }}>
                      {info.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subsystem Detail Modal-like view */}
          {selectedSubsystem && health?.subsystems[selectedSubsystem] && (
            <div style={{ ...styles.card, marginTop: '20px', borderColor: '#4caf50' }}>
              <h3 style={styles.sectionTitle}>Subsystem Detail: {selectedSubsystem}</h3>
              <div style={styles.grid2}>
                <div>
                  <p><strong>Status:</strong> {health.subsystems[selectedSubsystem].status}</p>
                  <p><strong>Checks Conducted:</strong> {health.subsystems[selectedSubsystem].checksCount}</p>
                  <p><strong>Passed:</strong> {health.subsystems[selectedSubsystem].passedChecks}</p>
                  <p><strong>Failed:</strong> {health.subsystems[selectedSubsystem].failedChecks}</p>
                </div>
                <div>
                  <p><strong>Active Subsystem Metrics:</strong></p>
                  <pre style={styles.codeBlock}>
                    {JSON.stringify(health.subsystems[selectedSubsystem].metrics, null, 2)}
                  </pre>
                </div>
              </div>
              {health.subsystems[selectedSubsystem].errors.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong style={{ color: '#f44336' }}>Errors:</strong>
                  <ul>
                    {health.subsystems[selectedSubsystem].errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Failed Validations and Warnings */}
          <div style={{ marginTop: '20px' }}>
            {report.errors.length > 0 && (
              <div style={{ ...styles.alertCard, borderLeftColor: '#f44336' }}>
                <h4 style={{ color: '#f44336', marginTop: 0 }}>Critical Platform Failures ({report.errors.length})</h4>
                <ul style={styles.list}>
                  {report.errors.map((err: string, i: number) => (
                    <li key={i} style={styles.alertItem}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.warnings.length > 0 && (
              <div style={{ ...styles.alertCard, borderLeftColor: '#ff9800', marginTop: '15px' }}>
                <h4 style={{ color: '#ff9800', marginTop: 0 }}>Architecture Warnings & Notices ({report.warnings.length})</h4>
                <ul style={styles.list}>
                  {report.warnings.map((warn: string, i: number) => (
                    <li key={i} style={styles.alertItem}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Integration Pipeline */}
      {viewMode === 'pipeline' && (
        <div style={styles.tabContent}>
          <div style={styles.timelineContainer}>
            {report.pipelineSteps.map((step: any, idx: number) => (
              <div key={step.stage} style={styles.timelineStep}>
                <div style={styles.timelineBadge}>
                  {getStatusIcon(step.status)}
                </div>
                <div style={styles.timelineContent}>
                  <div style={styles.timelineHeader}>
                    <h4 style={{ margin: 0 }}>{step.stage}</h4>
                    <span style={styles.timelineTime}>{step.durationMs}ms</span>
                  </div>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#aaa' }}>
                    Status: <strong style={{ color: step.status === 'Success' ? '#4caf50' : '#f44336' }}>{step.status}</strong> | Output Contract: {step.outputPassed ? '🟢 Validated' : '🔴 Failed'}
                  </p>
                  {step.error && (
                    <div style={styles.stepError}>
                      <strong>Error:</strong> {step.error}
                    </div>
                  )}
                  {step.metrics && Object.keys(step.metrics).length > 0 && (
                    <div style={styles.stepMetrics}>
                      {Object.entries(step.metrics).map(([k, v]: any) => (
                        <span key={k} style={styles.metricBadge}>{k}: {v}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Dependency Graph */}
      {viewMode === 'dependencies' && (
        <div style={styles.tabContent}>
          <div style={styles.grid2}>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Dependency Analysis</h3>
              <p><strong>Total Modules Analyzed:</strong> {report.dependencyGraph.nodes.length}</p>
              <p><strong>Unused Modules:</strong> {report.dependencyGraph.unusedModules.length}</p>
              <p><strong>Circular Paths:</strong> {report.dependencyGraph.circularPaths.length}</p>
              <p><strong>Duplicate Providers:</strong> {report.dependencyGraph.duplicateProviders.length}</p>
              <p><strong>Orphan Modules:</strong> {report.dependencyGraph.orphanModules.length}</p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Circular Dependency Cycles</h3>
              {report.dependencyGraph.circularPaths.length === 0 ? (
                <div style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ No critical dependency cycles detected.</div>
              ) : (
                <ul style={styles.list}>
                  {report.dependencyGraph.circularPaths.map((path: string[], i: number) => (
                    <li key={i} style={styles.cycleItem}>
                      {path.join(' ➔ ')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Graphical Representation */}
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <h3 style={styles.sectionTitle}>Visual Module Topology Map</h3>
            <div style={styles.graphContainer}>
              <svg width="100%" height="300" style={{ background: '#1e1e1e', borderRadius: '4px' }}>
                {/* Draw clean interactive node circles with lines */}
                {report.dependencyGraph.nodes.slice(0, 10).map((node: any, idx: number) => {
                  const x = 50 + (idx % 5) * 150;
                  const y = 60 + Math.floor(idx / 5) * 120;
                  return (
                    <g key={node.id}>
                      {/* Lines to next nodes */}
                      {idx < 9 && (
                        <line 
                          x1={x} 
                          y1={y} 
                          x2={50 + ((idx + 1) % 5) * 150} 
                          y2={60 + Math.floor((idx + 1) / 5) * 120} 
                          stroke="#333" 
                          strokeWidth="2"
                        />
                      )}
                      <circle cx={x} cy={y} r="25" fill="#2d3748" stroke="#4caf50" strokeWidth="2" />
                      <text x={x} y={y + 5} fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">
                        {node.name.substring(0, 8)}
                      </text>
                      <text x={x} y={y + 40} fill="#aaa" fontSize="9" textAnchor="middle">
                        {node.layer}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85em', color: '#888' }}>
                Showing top 10 nodes in topology. Generate full DEPENDENCY_GRAPH_REPORT.md to see all imports.
              </div>
            </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2d2d2d',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #60a5fa, #34d399)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    margin: '5px 0 0 0',
    color: '#888',
    fontSize: '0.95rem'
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#2563eb'
    }
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    border: '1px solid #2d2d2d',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  cardHeader: {
    fontSize: '1rem',
    color: '#aaa',
    fontWeight: 'bold',
    marginBottom: '10px',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.05em'
  },
  largeScore: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  subtext: {
    fontSize: '0.85rem',
    color: '#888'
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '10px'
  },
  scoreItem: {
    textAlign: 'center' as 'center'
  },
  scoreLabel: {
    fontSize: '0.8rem',
    color: '#888'
  },
  mediumScore: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    marginTop: '5px'
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '2px solid #2d2d2d',
    marginBottom: '20px'
  },
  tab: {
    background: 'none',
    border: 'none',
    color: '#888',
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  activeTab: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderBottom: '2px solid #60a5fa',
    fontWeight: 'bold'
  },
  tabContent: {
    marginTop: '10px'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginTop: 0,
    marginBottom: '15px',
    color: '#f3f4f6',
    borderBottom: '1px solid #2d2d2d',
    paddingBottom: '8px'
  },
  list: {
    paddingLeft: '20px',
    margin: 0
  },
  listItem: {
    marginBottom: '10px',
    lineHeight: '1.4'
  },
  subsystemList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px'
  },
  subsystemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #2d2d2d',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  subsystemName: {
    fontWeight: 'bold'
  },
  subsystemScore: {
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  codeBlock: {
    backgroundColor: '#0d0d0d',
    color: '#34d399',
    padding: '10px',
    borderRadius: '4px',
    overflowX: 'auto' as 'auto',
    margin: 0
  },
  alertCard: {
    backgroundColor: '#1e1e1e',
    borderLeft: '4px solid transparent',
    borderRadius: '0 8px 8px 0',
    padding: '15px 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  alertItem: {
    marginBottom: '8px',
    fontSize: '0.95rem'
  },
  timelineContainer: {
    position: 'relative' as 'relative',
    paddingLeft: '30px'
  },
  timelineStep: {
    position: 'relative' as 'relative',
    marginBottom: '20px'
  },
  timelineBadge: {
    position: 'absolute' as 'absolute',
    left: '-30px',
    top: '2px',
    width: '20px',
    textAlign: 'center' as 'center'
  },
  timelineContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: '6px',
    border: '1px solid #2d2d2d',
    padding: '15px'
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timelineTime: {
    fontSize: '0.85rem',
    color: '#888',
    backgroundColor: '#2d2d2d',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  stepError: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid #f44336',
    borderRadius: '4px',
    color: '#f44336',
    padding: '10px',
    marginTop: '10px',
    fontSize: '0.9rem'
  },
  stepMetrics: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    gap: '8px',
    marginTop: '10px'
  },
  metricBadge: {
    backgroundColor: '#2d3748',
    color: '#60a5fa',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  cycleItem: {
    marginBottom: '8px',
    fontSize: '0.95rem',
    color: '#ff9800',
    fontFamily: 'monospace'
  },
  graphContainer: {
    marginTop: '15px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#121212',
    color: '#fff'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #2d2d2d',
    borderTop: '5px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '1.1rem',
    color: '#aaa'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center' as 'center',
    padding: '40px'
  }
};
