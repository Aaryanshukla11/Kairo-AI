import React, { useState } from 'react';

export const DatasetCleaningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'normalization' | 'quality' | 'rejections'>('overview');
  const [pipeline, setPipeline] = useState<any>({
    samplesProcessed: 143,
    accepted: 136,
    rejected: 7,
    normalizationSummary: {
      utf8NormalizedCount: 12,
      lineEndingsNormalizedCount: 143,
      whitespaceNormalizedCount: 98,
      filenamesNormalizedCount: 3,
      languagesNormalizedCount: 8,
      metadataNormalizedCount: 44
    },
    qualityMetrics: {
      averageQualityScore: 84,
      syntaxValidityCount: 135,
      metadataCompletenessCount: 136,
      formattingConsistencyCount: 110,
      encodingQualityCount: 132,
      sampleCompletenessCount: 128
    },
    rejectionReasons: [
      { reason: 'Contains binary file signatures or NUL bytes', count: 3 },
      { reason: 'File content is empty', count: 2 },
      { reason: 'Quality score below minimum (40)', count: 2 }
    ],
    qualityDistribution: [
      { range: '81-100', count: 92 },
      { range: '61-80', count: 34 },
      { range: '41-60', count: 10 },
      { range: '21-40', count: 2 },
      { range: '0-20', count: 5 }
    ],
    history: [
      { time: '10:35:00', event: 'Loaded collected dataset (143 samples)', type: 'PipelineStarted' },
      { time: '10:35:02', event: 'Normalized UTF-8 NFC encodings for 12 files', type: 'EncodingNormalized' },
      { time: '10:35:05', event: 'Normalized metadata paths and defaults', type: 'MetadataNormalized' },
      { time: '10:35:08', event: 'Normalized CRLF line endings and trailing spacing', type: 'FormattingNormalized' },
      { time: '10:35:10', event: 'Detected corruption in 3 binary/NUL files', type: 'CorruptionDetected' },
      { time: '10:35:12', event: 'Repaired 2 recoverable truncated JSON samples', type: 'SampleRepaired' },
      { time: '10:35:15', event: 'Assigned quality scores: Average 84', type: 'QualityScored' },
      { time: '10:35:18', event: 'Generated clean dataset: 136 accepted, 7 rejected', type: 'PipelineCompleted' }
    ]
  });

  const [isCleaning, setIsCleaning] = useState(false);

  const handleRunCleaning = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setPipeline((prev: any) => ({
        ...prev,
        samplesProcessed: prev.samplesProcessed + 10,
        accepted: prev.accepted + 9,
        rejected: prev.rejected + 1,
        history: [
          { time: new Date().toLocaleTimeString(), event: 'Triggered incremental dataset cleaning pipeline', type: 'PipelineStarted' },
          ...prev.history
        ]
      }));
      setIsCleaning(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.96) 0%, rgba(12, 18, 32, 0.98) 100%)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
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
              Dataset Cleaning Pipeline Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(167, 139, 250, 0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T003
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Encoding UTF-8, Whitespace Trimming, Corruption Scanning & Quality Scoring
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunCleaning}
            disabled={isCleaning}
            style={{
              backgroundColor: isCleaning ? 'rgba(167, 139, 250, 0.5)' : '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isCleaning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isCleaning ? 'Cleaning...' : 'Execute Clean'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['overview', 'normalization', 'quality', 'rejections'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#a78bfa' : '#94a3b8',
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
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Processed</span>
          <strong style={{ fontSize: '14px', color: '#f1f5f9' }}>{pipeline.samplesProcessed} files</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Accepted (Clean)</span>
          <strong style={{ fontSize: '14px', color: '#10b981' }}>{pipeline.accepted} files</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Rejected</span>
          <strong style={{ fontSize: '14px', color: '#ef4444' }}>{pipeline.rejected} files</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>Avg Quality Score</span>
          <strong style={{ fontSize: '14px', color: '#f59e0b' }}>{pipeline.qualityMetrics.averageQualityScore}/100</strong>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Cleaning Execution Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {pipeline.history.map((h: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>[{h.time}]</span>
                  <span style={{ color: '#cbd5e1' }}>{h.event}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#a78bfa', opacity: 0.8 }}>{h.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'normalization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Normalization Activity Summary</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <span style={{ color: '#cbd5e1' }}>UTF-8 NFC Normalizations</span>
              <strong style={{ color: '#a78bfa' }}>{pipeline.normalizationSummary.utf8NormalizedCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <span style={{ color: '#cbd5e1' }}>Line Endings (CRLF to LF)</span>
              <strong style={{ color: '#a78bfa' }}>{pipeline.normalizationSummary.lineEndingsNormalizedCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <span style={{ color: '#cbd5e1' }}>Whitespace Normalizations</span>
              <strong style={{ color: '#a78bfa' }}>{pipeline.normalizationSummary.whitespaceNormalizedCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <span style={{ color: '#cbd5e1' }}>Filename/Path Cleanups</span>
              <strong style={{ color: '#a78bfa' }}>{pipeline.normalizationSummary.filenamesNormalizedCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <span style={{ color: '#cbd5e1' }}>Language Standardizations</span>
              <strong style={{ color: '#a78bfa' }}>{pipeline.normalizationSummary.languagesNormalizedCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <span style={{ color: '#cbd5e1' }}>Metadata Field Trims</span>
              <strong style={{ color: '#a78bfa' }}>{pipeline.normalizationSummary.metadataNormalizedCount}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Quality Metric Breakdown</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#e2e8f0' }}>Syntax Validity</span>
                <span style={{ color: '#10b981' }}>{pipeline.qualityMetrics.syntaxValidityCount} passing</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#e2e8f0' }}>Metadata Completeness</span>
                <span style={{ color: '#10b981' }}>{pipeline.qualityMetrics.metadataCompletenessCount} passing</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#e2e8f0' }}>Formatting Consistency</span>
                <span style={{ color: '#f59e0b' }}>{pipeline.qualityMetrics.formattingConsistencyCount} passing</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                <span style={{ color: '#e2e8f0' }}>Encoding Quality</span>
                <span style={{ color: '#10b981' }}>{pipeline.qualityMetrics.encodingQualityCount} passing</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Quality Score Distribution</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {pipeline.qualityDistribution.map((dist: any) => (
                <div key={dist.range} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#e2e8f0' }}>Score {dist.range}</span>
                  <span style={{ color: '#a78bfa', fontWeight: 500 }}>{dist.count} samples</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rejections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Rejection Reason Distribution</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {pipeline.rejectionReasons.map((rej: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', fontSize: '11px' }}>
                <span style={{ color: '#fecaca' }}>{rej.reason}</span>
                <strong style={{ color: '#ef4444' }}>{rej.count} samples</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
