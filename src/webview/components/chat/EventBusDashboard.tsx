import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const EventBusDashboard: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [throughput, setThroughput] = useState(0);
  const [latency, setLatency] = useState(0);
  const [deadLetters, setDeadLetters] = useState<any[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  useEffect(() => {
    const handleEventBusUpdate = (msg: any) => {
      if (msg.type === MessageType.EVENT_BUS_UPDATE as any) {
        const payload = msg.payload || {};
        if (payload.event) {
          const ev = payload.event;
          setEvents(prev => [ev, ...prev].slice(0, 30));
          setThroughput(prev => prev + 1);
          if (ev.payload?.durationMs) {
            setLatency(prev => Math.round((prev * 0.9 + ev.payload.durationMs * 0.1) * 100) / 100);
          }
          if (ev.executionStatus === 'Failed' || ev.type === 'EventDeadLettered') {
            setDeadLetters(prev => [ev, ...prev]);
          }
          if (ev.payload?.workflowId) {
            setActiveWorkflow(ev.payload.workflowId);
          }
        }
      }
    };

    vscodeBridge.subscribe(MessageType.EVENT_BUS_UPDATE as any, handleEventBusUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.EVENT_BUS_UPDATE as any, handleEventBusUpdate);
    };
  }, []);

  const handleStartWorkflow = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.EVENT_BUS_REQUEST as any,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'START_WORKFLOW',
        workflowId: `wf-${Math.random().toString(36).substr(2, 5)}`,
        initialPayload: { task: 'Execution Safety Orchestration' }
      },
      version: '1.0.0' as any
    });
  };

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Event Bus & Workflow</h4>
        <button 
          onClick={handleStartWorkflow}
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Run Workflow
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4ec9b0' }}>
            {throughput}
          </div>
          <div style={{ fontSize: '9px', color: '#888' }}>Total Throughput</div>
        </div>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#cca700' }}>
            {latency} ms
          </div>
          <div style={{ fontSize: '9px', color: '#888' }}>Average Latency</div>
        </div>
      </div>

      {activeWorkflow && (
        <div style={{ fontSize: '11px', color: '#aaa' }}>
          Active Workflow: <strong style={{ color: '#4ec9b0' }}>{activeWorkflow}</strong>
        </div>
      )}

      {/* DLQ */}
      {deadLetters.length > 0 && (
        <div style={{ backgroundColor: 'rgba(244,67,54,0.08)', border: '1px solid #f44336', borderRadius: '4px', padding: '8px' }}>
          <div style={{ fontWeight: 'bold', color: '#f44336', marginBottom: '4px' }}>Dead Letter Queue ({deadLetters.length})</div>
          {deadLetters.slice(0, 3).map((dl, i) => (
            <div key={i} style={{ fontSize: '10px', color: '#ddd' }}>
              • {dl.eventId}: {dl.payload?.reason || 'Unknown error'}
            </div>
          ))}
        </div>
      )}

      {/* Stream list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>Live Event Stream:</div>
        <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          {events.length === 0 ? (
            <span style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px' }}>No events published yet.</span>
          ) : (
            events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)', padding: '2px 0' }}>
                <span style={{ color: '#9cdcfe' }}>{ev.type || 'Event'}</span>
                <span style={{ color: '#888' }}>{ev.payload?.eventId || 'EV-ID'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default EventBusDashboard;
