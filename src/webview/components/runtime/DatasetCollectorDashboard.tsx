import React, { useState } from 'react';

export interface DatasetCollectorDashboardProps {
  initialDatasetId?: string;
}

export const DatasetCollectorDashboard: React.FC<DatasetCollectorDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'breakdown' | 'manifest'>('overview');
  const [collector, setCollector] = useState<any>({
    activeSources: [
      { path: 'c:/projects/kairo-ai/src', type: 'Local Workspace', isReachable: true, files: 98 },
      { path: 'github.com/Kairo-AI/core.git', type: 'Git Repository', isReachable: true, files: 44 },
      { path: 'c:/docs/architecture.md', type: 'Markdown Document', isReachable: true, files: 1 }
    ],
    collectedFiles: 143,
    totalBytes: 452890,
    progress: 100,
    integrityStatus: 'Verified',
    languages: [
      { name: 'TypeScript', count: 98, percentage: '68.5%' },
      { name: 'JavaScript', count: 32, percentage: '22.4%' },
      { name: 'JSON', count: 12, percentage: '8.4%' },
      { name: 'Markdown', count: 1, percentage: '0.7%' }
    ],
    licenses: [
      { name: 'MIT', count: 120, status: 'Permissible' },
      { name: 'Apache-2.0', count: 22, status: 'Permissible' },
      { name: 'Unknown', count: 1, status: 'Review Needed' }
    ],
    history: [
      { time: '10:30:12', event: 'Discovered source paths: 3 sources resolved', type: 'SourceDiscovered' },
      { time: '10:30:14', event: 'Validated source reachability: 100% reachable', type: 'SourceValidated' },
      { time: '10:30:18', event: 'Scanned 143 raw file items across sources', type: 'FilesScanned' },
      { time: '10:30:20', event: 'Extracted metadata and language distributions', type: 'MetadataExtracted' },
      { time: '10:30:22', event: 'Detected licenses: 120 MIT, 22 Apache-2.0, 1 Unknown', type: 'LicenseDetected' },
      { time: '10:30:24', event: 'Generated provenance records with SHA-256 checksums', type: 'ProvenanceGenerated' },
      { time: '10:30:25', event: 'Integrity validation passed (0 errors)', type: 'IntegrityValidated' },
      { time: '10:30:26', event: 'Created collection manifest COL-MAN-1725', type: 'ManifestCreated' },
      { time: '10:30:27', event: 'Collection report published successfully', type: 'ReportPublished' }
    ],
    manifest: {
      manifestId: "COL-MAN-1725",
      datasetId: "ds-ts-v1",
      collectionTime: 1775212227000,
      totalFiles: 143,
      totalBytes: 452890,
      licensesDistribution: { "MIT": 120, "Apache-2.0": 22, "Unknown": 1 },
      languagesDistribution: { "TypeScript": 98, "JavaScript": 32, "JSON": 12, "Markdown": 1 },
      integrityStatus: "valid",
      version: "1.0.0"
    }
  });

  const [isCollecting, setIsCollecting] = useState(false);

  const handleRunCollection = () => {
    setIsCollecting(true);
    setTimeout(() => {
      setCollector((prev: any) => ({
        ...prev,
        collectedFiles: prev.collectedFiles + 5,
        totalBytes: prev.totalBytes + 12400,
        history: [
          { time: new Date().toLocaleTimeString(), event: 'Triggered incremental source discovery scan', type: 'SourceDiscovered' },
          ...prev.history
        ]
      }));
      setIsCollecting(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 24, 38, 0.95) 0%, rgba(12, 16, 28, 0.98) 100%)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
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
              Dataset Collector Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T002
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Source Discovery, Provenance Registry & Metadata Integrity Engine
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunCollection}
            disabled={isCollecting}
            style={{
              backgroundColor: isCollecting ? 'rgba(59, 130, 246, 0.5)' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isCollecting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isCollecting ? 'Collecting...' : 'Run Collection'}
          </button>

          <span style={{
            fontSize: '11px',
            backgroundColor: collector.integrityStatus === 'Verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: collector.integrityStatus === 'Verified' ? '#10b981' : '#ef4444',
            border: `1px solid ${collector.integrityStatus === 'Verified' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '3px 10px',
            borderRadius: '12px',
            fontWeight: 600
          }}>
            Integrity: {collector.integrityStatus}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['overview', 'sources', 'breakdown', 'manifest'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#38bdf8' : '#94a3b8',
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

      {/* Top Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Active Sources</span>
          <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{collector.activeSources.length} sources</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Collected Files</span>
          <strong style={{ fontSize: '14px', color: '#38bdf8' }}>{collector.collectedFiles} files</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Total Data Size</span>
          <strong style={{ fontSize: '14px', color: '#a78bfa' }}>{(collector.totalBytes / 1024).toFixed(1)} KB</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Collection Progress</span>
          <strong style={{ fontSize: '14px', color: '#10b981' }}>{collector.progress}%</strong>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* History logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Collection History Pipeline</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
              {collector.history.map((h: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>[{h.time}]</span>
                    <span style={{ color: '#cbd5e1' }}>{h.event}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#38bdf8', opacity: 0.8 }}>{h.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Discovered & Active Sources</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {collector.activeSources.map((src: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '11px' }}>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{src.path}</div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>Type: {src.type}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#cbd5e1' }}>{src.files} samples</span>
                  <span style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Reachable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Language Breakdown</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {collector.languages.map((lang: any) => (
                <div key={lang.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#e2e8f0' }}>{lang.name}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#38bdf8' }}>{lang.count} files</span>
                    <span style={{ color: '#64748b' }}>({lang.percentage})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>License Distribution</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {collector.licenses.map((lic: any) => (
                <div key={lic.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#e2e8f0' }}>{lic.name}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#cbd5e1' }}>{lic.count} files</span>
                    <span style={{ fontSize: '9px', backgroundColor: lic.status === 'Permissible' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: lic.status === 'Permissible' ? '#10b981' : '#f59e0b', padding: '1px 5px', borderRadius: '4px' }}>{lic.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manifest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Assembled Manifest JSON</span>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            fontFamily: 'Fira Code, Consolas, Monaco, monospace',
            fontSize: '11px',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            color: '#38bdf8'
          }}>
            {JSON.stringify(collector.manifest, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};
