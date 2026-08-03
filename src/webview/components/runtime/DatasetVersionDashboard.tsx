import React, { useState } from 'react';

export const DatasetVersionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'versions' | 'comparison' | 'lineage' | 'timeline'>('versions');
  const [versionState, setVersionState] = useState<any>({
    versions: [
      { version: '1.0.0', parent: 'None', samples: 143, tokens: '45.2K', creation: '2026-08-03 10:30', checksum: 'sha256-abc890', languages: 'TS, JS, JSON', averageQuality: 82 },
      { version: '1.1.0', parent: '1.0.0', samples: 136, tokens: '42.1K', creation: '2026-08-03 12:05', checksum: 'sha256-xyz456', languages: 'TS, JS, JSON', averageQuality: 88 }
    ],
    comparison: {
      v1: '1.0.0',
      v2: '1.1.0',
      sampleDiff: -7,
      tokenDiff: '-3.1K',
      qualityScoreDiff: '+6',
      duplicatesRemoved: 18,
      checksumsMatch: false
    },
    lineageNodes: [
      { version: '1.0.0', parent: 'None', transformations: 'Initial Workspace Collection', pipeline: 'Collector Engine v1.0.0' },
      { version: '1.1.0', parent: '1.0.0', transformations: 'UTF-8 normalizations, CRLF to LF, space Collapsing, duplicate files resolved', pipeline: 'Cleaning & Deduplication Engines' }
    ],
    history: [
      { time: '14:02:00', event: 'Ingested deduplicated dataset', type: 'ReceiveDataset' },
      { time: '14:02:02', event: 'Created immutable snapshot SNAP-ds-1-1.1.0', type: 'SnapshotGenerated' },
      { time: '14:02:05', event: 'Calculated global checksum sha256-xyz456', type: 'GenerateChecksums' },
      { time: '14:02:08', event: 'Built manifest VER-MAN-ds-1-1.1.0', type: 'CreateManifest' },
      { time: '14:02:11', event: 'Registered version 1.1.0 in immutable registry', type: 'UpdateRegistry' },
      { time: '14:02:14', event: 'Validated lineage linkages and validation completed', type: 'ValidateLineage' }
    ]
  });

  const [isVersioning, setIsVersioning] = useState(false);

  const handleCreateVersion = () => {
    setIsVersioning(true);
    setTimeout(() => {
      setVersionState((prev: any) => ({
        ...prev,
        versions: [
          ...prev.versions,
          { version: '1.2.0', parent: '1.1.0', samples: 140, tokens: '43.2K', creation: new Date().toLocaleTimeString(), checksum: 'sha256-new789', languages: 'TS, JS, Py', averageQuality: 90 }
        ],
        history: [
          { time: new Date().toLocaleTimeString(), event: 'Registered dataset version increment v1.2.0', type: 'VersionCreated' },
          ...prev.history
        ]
      }));
      setIsVersioning(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 36, 48, 0.96) 0%, rgba(12, 22, 32, 0.98) 100%)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.42)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>
              Dataset Version Manager Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#0ea5e9',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T005
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Tracking Reproducibility Lineage Trees, Comparing Iterations, and Committing Immutable Snapshots
          </span>
        </div>

        <div>
          <button
            onClick={handleCreateVersion}
            disabled={isVersioning}
            style={{
              backgroundColor: isVersioning ? 'rgba(14, 165, 233, 0.5)' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isVersioning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isVersioning ? 'Versioning...' : 'Build Version'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['versions', 'comparison', 'lineage', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#0ea5e9' : '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'versions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Immutable Version Registry</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {versionState.versions.map((v: any, idx: number) => (
              <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#0ea5e9', fontSize: '12px' }}>v{v.version}</strong>
                  <span style={{ color: '#64748b' }}>Parent: {v.parent}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', color: '#cbd5e1' }}>
                  <div>Samples: <span style={{ color: '#0ea5e9' }}>{v.samples}</span></div>
                  <div>Quality Score: <span style={{ color: '#eab308' }}>{v.averageQuality}/100</span></div>
                  <div>Checksum: <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{v.checksum}</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#64748b', fontSize: '10px' }}>
                  <span>Languages: {v.languages}</span>
                  <span>Committed: {v.creation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Comparison:</span>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Comparing v{versionState.comparison.v1} vs v{versionState.comparison.v2}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Sample Count Difference</div>
              <strong style={{ color: versionState.comparison.sampleDiff < 0 ? '#ef4444' : '#10b981', fontSize: '13px' }}>
                {versionState.comparison.sampleDiff} samples
              </strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Quality Score Delta</div>
              <strong style={{ color: '#10b981', fontSize: '13px' }}>{versionState.comparison.qualityScoreDiff} score</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Duplicates Cleared</div>
              <strong style={{ color: '#ec4899', fontSize: '13px' }}>{versionState.comparison.duplicatesRemoved} duplicates</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Checksum Identity</div>
              <strong style={{ color: '#ef4444', fontSize: '13px' }}>Modified (Different hashes)</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lineage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Reproducibility Lineage Graph</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {versionState.lineageNodes.map((n: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '11px' }}>
                <div style={{ textAlign: 'center', minWidth: '50px' }}>
                  <div style={{ color: '#0ea5e9', fontWeight: 600 }}>v{n.version}</div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>Parent: {n.parent}</div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px', color: '#cbd5e1' }}>
                  <div><strong style={{ color: '#f1f5f9' }}>Transformation:</strong> {n.transformations}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Stages: {n.pipeline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Versioning History Logs</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {versionState.history.map((h: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>[{h.time}]</span>
                  <span style={{ color: '#cbd5e1' }}>{h.event}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#0ea5e9', opacity: 0.8 }}>{h.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
