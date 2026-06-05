import React, { useEffect, useState } from 'react';
import { workspaceService } from '../../services/workspaceService';
import { WorkspaceSummary } from '../../../core/workspace/workspaceTypes';

export function WorkspaceSummaryCard(): React.JSX.Element {
  const [summary, setSummary] = useState<WorkspaceSummary | string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workspaceService.getWorkspaceSummary()
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => {
        console.error('Workspace scan failed:', err);
        setSummary('Workspace Not Found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="workspace-card loading" style={{ padding: 'var(--spacing-16)', textAlign: 'center', opacity: 0.7 }}>
        <span>Analyzing workspace intelligence...</span>
      </div>
    );
  }

  if (!summary || summary === 'Workspace Not Found') {
    return (
      <div className="workspace-card error" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--spacing-16)',
        color: 'var(--text-secondary)',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        Workspace Not Found
      </div>
    );
  }

  const s = summary as WorkspaceSummary;

  return (
    <div className="workspace-card" style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--spacing-16)',
      boxShadow: 'var(--shadow-subtle)',
      width: '100%',
      maxWidth: '320px',
      margin: 'var(--spacing-16) auto',
      boxSizing: 'border-box',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-12)' }}>
        <span style={{ fontSize: '16px' }}>📂</span>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Workspace
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-4)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Framework:</span>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.framework}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-4)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Language:</span>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.language}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-4)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Git Repository:</span>
          <span style={{ fontWeight: 500, color: s.gitEnabled ? 'var(--success)' : 'var(--text-secondary)' }}>
            {s.gitEnabled ? '✓ Enabled' : 'Not Detected'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-4)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Package Manager:</span>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.packageManager}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Build Tool:</span>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.buildTool}</span>
        </div>
      </div>
    </div>
  );
}
export default WorkspaceSummaryCard;
