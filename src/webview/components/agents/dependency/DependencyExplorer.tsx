import React, { useState } from 'react';
import { DependencyResolutionReport, DependencyNode, DependencyEdge, OptimizationSuggestion } from '../../../../core/dependencyResolution/dependencyTypes';

interface DependencyExplorerProps {
  report: DependencyResolutionReport;
  onScan: () => void;
  loading: boolean;
}

export const DependencyExplorer: React.FC<DependencyExplorerProps> = ({ report, onScan, loading }) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'tree' | 'cycles' | 'optimizations'>('graph');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = Object.values(report.graph.nodes);
  const edges = Object.values(report.graph.edges);

  const getRiskColor = (risk: string) => {
    if (risk === 'Critical') return '#f44336';
    if (risk === 'High') return '#ff9800';
    if (risk === 'Medium') return '#ffc107';
    if (risk === 'Low') return '#8bc34a';
    return '#4ec9b0';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'File': return '📄';
      case 'Module': return '📦';
      case 'Symbol': return '🔣';
      case 'Import': return '📥';
      case 'API': return '🔌';
      case 'Database': return '💾';
      case 'Configuration': return '⚙️';
      case 'Package': return '🗂️';
      default: return '🔗';
    }
  };

  // Simple rendering of tree representation
  const renderTree = (nodeId: string, depth = 0, visited = new Set<string>()): React.JSX.Element | null => {
    if (visited.has(nodeId) || depth > 4) return null;
    visited.add(nodeId);

    const node = report.graph.nodes[nodeId];
    if (!node) return null;

    const children = report.graph.adjacencyList[nodeId] || [];

    return (
      <div key={`${nodeId}-${depth}`} style={{ marginLeft: `${depth * 16}px`, marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
          <span>{getTypeIcon(node.type)}</span>
          <span style={{ fontWeight: depth === 0 ? 'bold' : 'normal', color: '#d4d4d4' }}>{node.name}</span>
          <span style={{ fontSize: '9px', color: '#666' }}>({node.type})</span>
        </div>
        {children.map(childId => renderTree(childId, depth + 1, new Set(visited)))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#d4d4d4', fontSize: '12px' }}>
      {/* Header and Scan Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Dependency Explorer</h3>
        <button
          onClick={onScan}
          disabled={loading}
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '4px',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          {loading ? 'Resolving...' : 'Resolve Dependencies'}
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: report.confidence > 0.8 ? '#4ec9b0' : '#ff9800' }}>
            {Math.round(report.confidence * 100)}%
          </div>
          <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>Confidence Score</div>
        </div>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#569cd6' }}>
            {nodes.length}
          </div>
          <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>Total Nodes</div>
        </div>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ce9178' }}>
            {edges.length}
          </div>
          <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>Total Connections</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)' }}>
        {(['graph', 'tree', 'cycles', 'optimizations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: activeTab === tab ? '#fff' : '#888',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--vscode-button-background)' : 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '11px',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ minHeight: '150px' }}>
        {activeTab === 'graph' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontWeight: '500', color: '#888', marginBottom: '4px' }}>Adjacency Relations (Source ➔ Target)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '8px', borderRadius: '4px' }}>
              {edges.map(edge => (
                <div 
                  key={edge.id} 
                  onClick={() => setSelectedNode(edge.source)}
                  style={{ 
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '3px',
                    backgroundColor: selectedNode === edge.source ? 'rgba(255,255,255,0.05)' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ color: '#569cd6' }}>{edge.source.replace(/^(file|symbol|import|api|db|config|package):/, '')}</span>
                    <span style={{ color: '#888', margin: '0 6px' }}>➔</span>
                    <span style={{ color: '#9cdcfe' }}>{edge.target.replace(/^(file|symbol|import|api|db|config|package):/, '')}</span>
                  </div>
                  <span style={{ fontSize: '9px', padding: '2px 4px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.05)', color: getRiskColor(edge.risk) }}>
                    {edge.risk} Risk
                  </span>
                </div>
              ))}
            </div>
            {selectedNode && report.graph.nodes[selectedNode] && (
              <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid var(--border)', marginTop: '4px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Node details: {report.graph.nodes[selectedNode]?.name}</div>
                <div>Type: {report.graph.nodes[selectedNode]?.type}</div>
                <div>ID: {selectedNode}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tree' && (
          <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '8px', borderRadius: '4px' }}>
            {nodes.filter(n => {
              // Find root nodes (no incoming edges)
              return !edges.some(e => e.target === n.id);
            }).map(n => renderTree(n.id))}
          </div>
        )}

        {activeTab === 'cycles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.circularReport.hasCycles ? (
              report.circularReport.cycles.map((cycle, idx) => (
                <div key={idx} style={{ padding: '8px', backgroundColor: 'rgba(244, 67, 54, 0.05)', border: '1px solid #f44336', borderRadius: '4px', color: '#f44336' }}>
                  <strong>⚠️ Cycle #{idx + 1}:</strong> {cycle.map(nodeId => nodeId.replace(/^(file|symbol|import|api|db|config|package):/, '')).join(' ➔ ')}
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', color: '#666', padding: '12px 0', textAlign: 'center' }}>
                No circular dependencies detected. Graph integrity is verified!
              </div>
            )}

            <div style={{ marginTop: '8px' }}>
              <div style={{ fontWeight: '500', color: '#888', marginBottom: '4px' }}>Critical Path execution order:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', backgroundColor: '#1e1e1e', padding: '8px', borderRadius: '4px' }}>
                {report.executionOrder.map((nodeId, idx) => (
                  <span key={nodeId} style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '3px' }}>
                    {idx + 1}. {nodeId.replace(/^(file|symbol|import|api|db|config|package):/, '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimizations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.suggestions.length > 0 ? (
              report.suggestions.map(suggestion => (
                <div key={suggestion.id} style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ color: suggestion.type === 'Redundant' ? '#cca700' : '#4ec9b0' }}>{suggestion.type} Link</strong>
                    <span style={{ fontSize: '9px', color: '#888' }}>{suggestion.severity} Severity</span>
                  </div>
                  <div>{suggestion.description}</div>
                </div>
              ))
            ) : (
              <div style={{ fontStyle: 'italic', color: '#666', padding: '12px 0', textAlign: 'center' }}>
                No optimizations needed. Graph is fully streamlined!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
