import React, { useState } from 'react';

export const DatasetBuilderDashboard: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>([
    {
      id: 'ds-ts-coder-v1',
      name: 'TypeScript Code Completions',
      version: '1.0.0',
      fileCount: 45,
      sizeBytes: 154000,
      tokenEstimate: 38500,
      validationStatus: 'Valid',
      languages: { TypeScript: 30, JavaScript: 15 },
      preview: `{
  "datasetId": "ds-ts-coder-v1",
  "name": "TypeScript Code Completions",
  "version": "1.0.0",
  "license": "MIT",
  "tags": ["local", "typescript"]
}`
    }
  ]);

  const [activeDs, setActiveDs] = useState<any>(datasets[0]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 58, 0.9) 0%, rgba(20, 20, 48, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '12px'
      }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Local Dataset Builder</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dataset Compiling & Manifest Generator</span>
        </div>
        <span style={{
          fontSize: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          {activeDs.validationStatus}
        </span>
      </div>

      {/* Dataset Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Dataset</span>
        <select
          value={activeDs.id}
          onChange={(e) => {
            const found = datasets.find(d => d.id === e.target.value);
            if (found) setActiveDs(found);
          }}
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#f8fafc',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          {datasets.map(d => (
            <option key={d.id} value={d.id}>{d.name} ({d.version})</option>
          ))}
        </select>
      </div>

      {/* Grid Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Size</span>
          <strong style={{ fontSize: '13px', color: '#cbd5e1' }}>{(activeDs.sizeBytes / 1024).toFixed(1)} KB</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Files Count</span>
          <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{activeDs.fileCount} files</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Token Estimate</span>
          <strong style={{ fontSize: '13px', color: '#10b981' }}>{activeDs.tokenEstimate} tok</strong>
        </div>
      </div>

      {/* Languages & Version grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Languages distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Languages Distribution</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.entries(activeDs.languages).map(([lang, count]: any) => (
              <div key={lang} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px', fontSize: '10px' }}>
                <span style={{ color: '#cbd5e1' }}>{lang}</span>
                <span style={{ color: '#64748b' }}>{count} files</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Version information</span>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '10px', fontSize: '10px' }}>
            <div>Active: <strong style={{ color: '#38bdf8' }}>{activeDs.version}</strong></div>
            <div style={{ color: '#64748b', marginTop: '4px' }}>License: MIT</div>
          </div>
        </div>
      </div>

      {/* Manifest Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Assembled Manifest Preview</span>
        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          fontFamily: 'Fira Code, Consolas, Monaco, monospace',
          fontSize: '11px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          color: '#38bdf8'
        }}>
          {activeDs.preview}
        </div>
      </div>
    </div>
  );
};
