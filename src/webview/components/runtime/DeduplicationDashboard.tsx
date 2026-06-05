import React, { useState } from 'react';

export const DeduplicationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clusters' | 'removed' | 'timeline'>('overview');
  const [dedup, setDedup] = useState<any>({
    totalSamples: 136,
    duplicatesFound: 18,
    spaceSavedBytes: 154800,
    exactDuplicates: 10,
    structuralDuplicates: 5,
    semanticDuplicates: 3,
    clusters: [
      {
        clusterId: 'CL-01',
        representative: 'src/core/datasetCollector/collectorEngine.ts',
        duplicatesCount: 2,
        similarity: 'Exact match (1.0)',
        resolution: 'Selected higher quality representative'
      },
      {
        clusterId: 'CL-02',
        representative: 'src/webview/layout/Header.tsx',
        duplicatesCount: 1,
        similarity: 'Structural match (0.95)',
        resolution: 'Selected representative with complete metadata'
      },
      {
        clusterId: 'CL-03',
        representative: 'docs/guide.md',
        duplicatesCount: 1,
        similarity: 'Semantic match (0.88)',
        resolution: 'Selected representative with newer version'
      }
    ],
    removedSamples: [
      { filePath: 'src/temp/collectorEngine_copy.ts', type: 'Exact match copy', size: '24.5 KB' },
      { filePath: 'src/webview/layout/Header_backup.tsx', type: 'Backup revision', size: '12.1 KB' },
      { filePath: 'docs/old/guide_v1.md', type: 'Semantic duplicates', size: '8.4 KB' }
    ],
    similarityDistribution: [
      { range: 'Exact Match (1.0)', count: 10 },
      { range: 'High (0.90 - 0.99)', count: 5 },
      { range: 'Medium (0.80 - 0.89)', count: 3 },
      { range: 'Low (below 0.80)', count: 118 }
    ],
    history: [
      { time: '12:05:00', event: 'Loaded dataset (136 samples) into deduplication memory', type: 'DeduplicationStarted' },
      { time: '12:05:02', event: 'Generated text shingles and MinHash fingerprints', type: 'FingerprintsGenerated' },
      { time: '12:05:05', event: 'Exact matching check completed: 10 exact duplicate copies found', type: 'ExactMatchingCompleted' },
      { time: '12:05:08', event: 'Structural AST token verification: 5 structural duplicate candidates found', type: 'StructuralAnalysisCompleted' },
      { time: '12:05:12', event: 'Semantic similarity minhash Jaccard evaluation: 3 semantic matches found', type: 'SemanticSimilarityCompleted' },
      { time: '12:05:14', event: 'Duplicate clusters aggregated: 3 clusters generated', type: 'ClustersFormed' },
      { time: '12:05:15', event: 'Resolved representative choices and completed space-saving cleanup', type: 'DuplicatesResolved' },
      { time: '12:05:16', event: 'Deduplication execution completed: Saved 154,800 bytes', type: 'DeduplicationCompleted' }
    ]
  });

  const [isDeduplicating, setIsDeduplicating] = useState(false);

  const handleRunDeduplication = () => {
    setIsDeduplicating(true);
    setTimeout(() => {
      setDedup((prev: any) => ({
        ...prev,
        totalSamples: prev.totalSamples + 8,
        duplicatesFound: prev.duplicatesFound + 1,
        spaceSavedBytes: prev.spaceSavedBytes + 8200,
        history: [
          { time: new Date().toLocaleTimeString(), event: 'Triggered incremental duplicate cleanup matching', type: 'DeduplicationStarted' },
          ...prev.history
        ]
      }));
      setIsDeduplicating(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(28, 20, 48, 0.96) 0%, rgba(18, 12, 32, 0.98) 100%)',
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
              Dataset Deduplication Engine Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(236, 72, 153, 0.15)',
              color: '#ec4899',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T004
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Exact Matching, Token-based Structural Analysis, and MinHash Semantic Clustering
          </span>
        </div>

        <div>
          <button
            onClick={handleRunDeduplication}
            disabled={isDeduplicating}
            style={{
              backgroundColor: isDeduplicating ? 'rgba(236, 72, 153, 0.5)' : '#db2777',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isDeduplicating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isDeduplicating ? 'Deduplicating...' : 'Run Deduplication'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['overview', 'clusters', 'removed', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#ec4899' : '#94a3b8',
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
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Total Samples</span>
          <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{dedup.totalSamples} files</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Duplicates Found</span>
          <strong style={{ fontSize: '14px', color: '#ec4899' }}>{dedup.duplicatesFound} copies</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Deduplication Yield</span>
          <strong style={{ fontSize: '14px', color: '#10b981' }}>{(100 - (dedup.duplicatesFound / dedup.totalSamples * 100)).toFixed(1)}%</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Space Saved</span>
          <strong style={{ fontSize: '14px', color: '#38bdf8' }}>{(dedup.spaceSavedBytes / 1024).toFixed(1)} KB</strong>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Duplicate Matching Breakdown</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#cbd5e1' }}>Exact Hash Match</span>
                <span style={{ color: '#ec4899', fontWeight: 600 }}>{dedup.exactDuplicates}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#cbd5e1' }}>Structural token matching</span>
                <span style={{ color: '#ec4899', fontWeight: 600 }}>{dedup.structuralDuplicates}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#cbd5e1' }}>Semantic MinHash matching</span>
                <span style={{ color: '#ec4899', fontWeight: 600 }}>{dedup.semanticDuplicates}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Pairwise Similarity Distribution</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {dedup.similarityDistribution.map((dist: any) => (
                <div key={dist.range} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#cbd5e1' }}>{dist.range}</span>
                  <span style={{ color: '#a78bfa' }}>{dist.count} pairs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clusters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Duplicate Clusters Summary</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {dedup.clusters.map((c: any) => (
              <div key={c.clusterId} style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#ec4899' }}>Cluster {c.clusterId} ({c.duplicatesCount} duplicates)</strong>
                  <span style={{ color: '#94a3b8', fontSize: '10px' }}>{c.similarity}</span>
                </div>
                <div style={{ color: '#f1f5f9' }}>Representative: <span style={{ fontFamily: 'monospace' }}>{c.representative}</span></div>
                <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>Decision: {c.resolution}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'removed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Removed / Filtered Duplicates List</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {dedup.removedSamples.map((r: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#fecaca', fontFamily: 'monospace' }}>{r.filePath}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>{r.type}</span>
                  <strong style={{ color: '#ef4444' }}>{r.size}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Deduplication History Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {dedup.history.map((h: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>[{h.time}]</span>
                  <span style={{ color: '#cbd5e1' }}>{h.event}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#ec4899', opacity: 0.8 }}>{h.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
