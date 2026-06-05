import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';
import { PermissionAction, PermissionRiskLevel, PermissionStatus, PermissionPolicy } from '../../../core/permission/permissionTypes';

export const PermissionCenter: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [rememberDecision, setRememberDecision] = useState<boolean>(false);

  useEffect(() => {
    const handlePermissionUpdate = (msg: any) => {
      if (msg.type === MessageType.PERMISSION_UPDATE) {
        const { permissions: list, rules: activeRules } = msg.payload || {};
        if (list) setRequests(list);
        if (activeRules) setRules(activeRules);
      }
    };

    vscodeBridge.subscribe(MessageType.PERMISSION_UPDATE, handlePermissionUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PERMISSION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_HISTORY' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.PERMISSION_UPDATE, handlePermissionUpdate);
    };
  }, []);

  const handleDecision = (id: string, approved: boolean) => {
    const policy = rememberDecision 
      ? (approved ? PermissionPolicy.AlwaysAllow : PermissionPolicy.AlwaysDeny)
      : PermissionPolicy.AlwaysAsk;

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PERMISSION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GRANT', requestId: id, approved, policy },
      version: '1.0.0' as any
    });
  };

  const pendingRequests = requests.filter(r => r.status === PermissionStatus.Pending);
  const resolvedRequests = requests.filter(r => r.status !== PermissionStatus.Pending);

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Security Permission Center</h4>
        <span style={{ opacity: 0.6, fontSize: '11px' }}>Rules: <strong>{rules.length}</strong></span>
      </div>

      <div>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>Pending Authorizations ({pendingRequests.length})</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pendingRequests.map(r => (
            <div 
              key={r.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>{r.action}</span>
                <span style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  backgroundColor: r.riskLevel === 'Critical' || r.riskLevel === 'High' ? '#f85149' : '#d7ba7d',
                  color: '#000'
                }}>{r.riskLevel} Risk</span>
              </div>

              <div style={{ fontSize: '11px', color: '#aaa' }}>
                Resource: <code style={{ color: '#fff', fontSize: '10px' }}>{r.resource}</code>
              </div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.8 }}>
                Reason: {r.reason}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberDecision}
                    onChange={(e) => setRememberDecision(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  Remember decision
                </label>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => handleDecision(r.id, true)}
                    style={{
                      background: 'var(--vscode-button-background, #0e639c)',
                      color: '#fff',
                      border: 'none',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    Allow
                  </button>
                  <button 
                    onClick={() => handleDecision(r.id, false)}
                    style={{
                      background: 'transparent',
                      color: 'var(--vscode-errorForeground, #f85149)',
                      border: '1px solid var(--vscode-errorForeground, #f85149)',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    Deny
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingRequests.length === 0 && (
            <span style={{ fontStyle: 'italic', color: '#666', fontSize: '11px' }}>No pending authorization requests</span>
          )}
        </div>
      </div>

      <div>
        <h5 style={{ margin: '8px 0 4px 0', fontSize: '11px', color: '#888' }}>Decision History ({resolvedRequests.length})</h5>
        <div style={{
          maxHeight: '80px',
          overflowY: 'auto',
          padding: '4px 6px',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          fontSize: '11px'
        }}>
          {resolvedRequests.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
              <span>{r.action} ({r.resource})</span>
              <span style={{
                color: r.status === 'Approved' ? '#4ec9b0' : '#f85149',
                fontWeight: 'bold'
              }}>{r.status}</span>
            </div>
          ))}
          {resolvedRequests.length === 0 && (
            <span style={{ fontStyle: 'italic', color: '#666' }}>No decision logs recorded yet</span>
          )}
        </div>
      </div>
    </div>
  );
};
