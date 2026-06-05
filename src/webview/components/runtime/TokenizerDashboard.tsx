import React, { useState } from 'react';

export const TokenizerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'versions' | 'benchmarks' | 'comparison' | 'timeline'>('versions');
  const [tokenizerState, setTokenizerState] = useState<any>({
    versions: [
      { id: 'TOK-ds1-BPE-v1', version: '1.0.0', algorithm: 'BPE', vocabSize: 32000, coverage: '99.5%', compression: '3.4x', speed: '45K lines/s', status: 'Stable' },
      { id: 'TOK-ds1-SP-v1', version: '1.0.0', algorithm: 'SentencePiece', vocabSize: 32000, coverage: '99.8%', compression: '3.8x', speed: '38K lines/s', status: 'Active' }
    ],
    benchmarkResults: {
      artifactId: 'TOK-ds1-SP-v1',
      compressionRatio: '3.8x',
      vocabCoverage: '99.8%',
      unkRate: '0.04%',
      encodingSpeed: '38,200 lines/s',
      decodingSpeed: '45,800 lines/s',
      memory: '2.5 MB'
    },
    comparison: [
      { algorithm: 'SentencePiece', vocab: 32000, compression: 3.8, speed: '38K lines/s', coverage: '99.8%', unkRate: '0.04%' },
      { algorithm: 'BPE', vocab: 32000, compression: 3.4, speed: '45K lines/s', coverage: '99.5%', unkRate: '0.12%' },
      { algorithm: 'WordPiece', vocab: 32000, compression: 3.6, speed: '40K lines/s', coverage: '99.6%', unkRate: '0.08%' }
    ],
    history: [
      { time: '15:10:00', event: 'Initiated training pipeline (SentencePiece)', type: 'TrainingStarted' },
      { time: '15:10:02', event: 'Normalized training text NFC unicode formats', type: 'TextNormalized' },
      { time: '15:10:06', event: 'Trained vocabulary parameters (32,000 subwords extracted)', type: 'TokenizerTrained' },
      { time: '15:10:09', event: 'Validated vocabulary ranges (0 errors, contiguous indices checked)', type: 'VocabValidated' },
      { time: '15:10:11', event: 'Completed benchmark runs: compression 3.8x, UNK rate 0.04%', type: 'BenchmarkCompleted' },
      { time: '15:10:14', event: 'Tokenizer registered immutability in registry', type: 'TokenizerRegistered' }
    ]
  });

  const [isTraining, setIsTraining] = useState(false);

  const handleCreateTokenizer = () => {
    setIsTraining(true);
    setTimeout(() => {
      setTokenizerState((prev: any) => ({
        ...prev,
        versions: [
          ...prev.versions,
          { id: 'TOK-ds1-WP-v1', version: '1.1.0', algorithm: 'WordPiece', vocabSize: 32000, coverage: '99.7%', compression: '3.6x', speed: '40K lines/s', status: 'New' }
        ],
        history: [
          { time: new Date().toLocaleTimeString(), event: 'Trained WordPiece tokenizer v1.1.0', type: 'TokenizerRegistered' },
          ...prev.history
        ]
      }));
      setIsTraining(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(48, 20, 36, 0.96) 0%, rgba(32, 12, 22, 0.98) 100%)',
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
              Tokenizer Training Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(236, 72, 153, 0.15)',
              color: '#f472b6',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T006
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Training sentence-piece, BPE, and WordPiece tokenizers, monitoring compression rates and encoding speed benchmarks
          </span>
        </div>

        <div>
          <button
            onClick={handleCreateTokenizer}
            disabled={isTraining}
            style={{
              backgroundColor: isTraining ? 'rgba(219, 39, 119, 0.5)' : '#db2777',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isTraining ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isTraining ? 'Training...' : 'Train Tokenizer'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['versions', 'benchmarks', 'comparison', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#f472b6' : '#94a3b8',
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
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Trained Tokenizer Artifacts</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tokenizerState.versions.map((t: any, idx: number) => (
              <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#f472b6', fontSize: '12px' }}>{t.algorithm}</strong>
                  <span style={{ color: '#64748b' }}>Version: {t.version}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', color: '#cbd5e1' }}>
                  <div>Vocab Size: <span style={{ color: '#f472b6' }}>{t.vocabSize}</span></div>
                  <div>Compression: <span style={{ color: '#10b981' }}>{t.compression}</span></div>
                  <div>Speed: <span style={{ color: '#0ea5e9' }}>{t.speed}</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#64748b', fontSize: '10px' }}>
                  <span>Artifact ID: {t.id}</span>
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '1px 5px', borderRadius: '4px' }}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'benchmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Benchmark Results Profile</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Encoding Speed</div>
              <strong style={{ color: '#0ea5e9', fontSize: '13px' }}>{tokenizerState.benchmarkResults.encodingSpeed}</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Compression Ratio</div>
              <strong style={{ color: '#10b981', fontSize: '13px' }}>{tokenizerState.benchmarkResults.compressionRatio}</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Vocabulary Coverage</div>
              <strong style={{ color: '#f472b6', fontSize: '13px' }}>{tokenizerState.benchmarkResults.vocabCoverage}</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Unknown Token Rate</div>
              <strong style={{ color: '#ef4444', fontSize: '13px' }}>{tokenizerState.benchmarkResults.unkRate}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Algorithm Comparison Matrix</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tokenizerState.comparison.map((c: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
                <strong style={{ color: '#cbd5e1' }}>{c.algorithm}</strong>
                <div style={{ display: 'flex', gap: '15px', color: '#64748b' }}>
                  <span>Vocab: <strong style={{ color: '#f472b6' }}>{c.vocab}</strong></span>
                  <span>Compression: <strong style={{ color: '#10b981' }}>{c.compression}x</strong></span>
                  <span>Speed: <strong style={{ color: '#0ea5e9' }}>{c.speed}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Timeline History logs</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {tokenizerState.history.map((h: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>[{h.time}]</span>
                <span style={{ color: '#cbd5e1' }}>{h.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
