import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';
import { DiagnosticSeverity, DiagnosticCategory, DiagnosticStatus } from '../../../core/diagnostics/diagnosticsTypes';

export const DiagnosticsPanel: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [selectedDiagId, setSelectedDiagId] = useState<string | null>(null);

  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterModule, setFilterModule] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handleDiagnosticsUpdate = (msg: any) => {
      if (msg.type === MessageType.DIAGNOSTICS_UPDATE) {
        const { diagnostics: list, lastCreatedDiagnosticId } = msg.payload || {};
        if (list) setDiagnostics(list);
        if (lastCreatedDiagnosticId) setSelectedDiagId(lastCreatedDiagnosticId);
      }
    };

    vscodeBridge.subscribe(MessageType.DIAGNOSTICS_UPDATE, handleDiagnosticsUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.DIAGNOSTICS_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_HISTORY' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.DIAGNOSTICS_UPDATE, handleDiagnosticsUpdate);
    };
  }, []);

  const handleStatusChange = (id: string, status: DiagnosticStatus) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.DIAGNOSTICS_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'UPDATE_STATUS', diagnosticId: id, status },
      version: '1.0.0' as any
    });
  };

  const handleExport = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.DIAGNOSTICS_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'EXPORT' },
      version: '1.0.0' as any
    });
  };

  const filtered = diagnostics.filter(d => {
    if (filterSeverity && d.severity !== filterSeverity) return false;
    if (filterCategory && d.category !== filterCategory) return false;
    if (filterModule && !d.sourceModule.toLowerCase().includes(filterModule.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inMsg = d.message.toLowerCase().includes(q);
      const inDetails = d.details ? d.details.toLowerCase().includes(q) : false;
      if (!inMsg && !inDetails) return false;
    }
    return true;
  });

  const selectedDiag = diagnostics.find(d => d.id === selectedDiagId) || filtered[0];

  return (
    <div style={{
      backgroundColor: 'var(--vscode-sideBar-background, #252526)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      color: '#d4d4d4',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>System Diagnostics Panel</h4>
        <button 
          onClick={handleExport}
          style={{ background: 'var(--vscode-button-secondaryBackground, #3c3c3c)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
        >
          Export JSON
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select 
          value={filterSeverity} 
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{ backgroundColor: '#3c3c3c', border: '1px solid var(--border)', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontSize: '11px' }}
        >
          <option value="">All Severities</option>
          {Object.values(DiagnosticSeverity).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ backgroundColor: '#3c3c3c', border: '1px solid var(--border)', color: '#fff', padding: '2px 4px', borderRadius: '3px', fontSize: '11px' }}
        >
          <option value="">All Categories</option>
          {Object.values(DiagnosticCategory).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input 
          type="text" 
          placeholder="Filter Module..." 
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          style={{ backgroundColor: '#3c3c3c', border: '1px solid var(--border)', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', width: '100px' }}
        />

        <input 
          type="text" 
          placeholder="Search logs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ backgroundColor: '#3c3c3c', border: '1px solid var(--border)', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', flex: 1 }}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', maxHeight: '180px', overflowY: 'auto' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888' }}>Diagnostic Entries ({filtered.length})</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filtered.map(d => (
              <div 
                key={d.id}
                onClick={() => setSelectedDiagId(d.id)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: selectedDiagId === d.id ? 'var(--vscode-list-activeSelectionBackground, #37373d)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  <span style={{
                    color: d.severity === 'Critical' || d.severity === 'Error' ? '#f85149' :
                           d.severity === 'Warning' ? '#d7ba7d' : '#4ec9b0',
                    marginRight: '6px',
                    fontWeight: 'bold'
                  }}>●</span>
                  {d.message}
                </div>
                <span style={{ fontSize: '9px', opacity: 0.6 }}>{d.sourceModule}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No diagnostic logs match filters</span>
            )}
          </div>
        </div>

        {selectedDiag ? (
          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
              <div>Module: <strong style={{ color: '#fff' }}>{selectedDiag.sourceModule}</strong></div>
              <div>Severity: <strong style={{
                color: selectedDiag.severity === 'Critical' || selectedDiag.severity === 'Error' ? '#f85149' :
                       selectedDiag.severity === 'Warning' ? '#d7ba7d' : '#4ec9b0'
              }}>{selectedDiag.severity}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div>Message: <strong>{selectedDiag.message}</strong></div>
              {selectedDiag.details && <div>Details: <span style={{ opacity: 0.8 }}>{selectedDiag.details}</span></div>}
              <div>Category: <span style={{ opacity: 0.8 }}>{selectedDiag.category}</span></div>
              <div>Timestamp: <span style={{ opacity: 0.8 }}>{new Date(selectedDiag.timestamp).toLocaleString()}</span></div>
              {selectedDiag.operationId && <div>Operation ID: <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>{selectedDiag.operationId}</span></div>}
            </div>

            {selectedDiag.stackTrace && (
              <pre style={{
                backgroundColor: '#1e1e1e',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '6px',
                maxHeight: '60px',
                overflowY: 'auto',
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#d4d4d4',
                margin: 0
              }}>
                {selectedDiag.stackTrace}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {selectedDiag.status !== 'Resolved' && (
                <button 
                  onClick={() => handleStatusChange(selectedDiag.id, DiagnosticStatus.Resolved)}
                  style={{
                    background: '#4ec9b0',
                    color: '#000',
                    border: 'none',
                    padding: '3px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  Resolve
                </button>
              )}
              {selectedDiag.status !== 'Acknowledged' && (
                <button 
                  onClick={() => handleStatusChange(selectedDiag.id, DiagnosticStatus.Acknowledged)}
                  style={{
                    background: 'var(--vscode-button-background)',
                    color: '#fff',
                    border: 'none',
                    padding: '3px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Acknowledge
                </button>
              )}
              {selectedDiag.status !== 'Ignored' && (
                <button 
                  onClick={() => handleStatusChange(selectedDiag.id, DiagnosticStatus.Ignored)}
                  style={{
                    background: 'transparent',
                    color: '#888',
                    border: '1px solid #666',
                    padding: '2px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Ignore
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#666' }}>
            Select a diagnostic item to review stack traces
          </div>
        )}
      </div>
    </div>
  );
};
