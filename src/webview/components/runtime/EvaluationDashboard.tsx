import React, { useState } from 'react';

export const EvaluationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'runs' | 'leaderboard' | 'comparison' | 'logs'>('runs');
  const [evalState, setEvalState] = useState<any>({
    runs: [
      { runId: 'RUN-TOK-ds1-SP-1', artifact: 'SentencePiece Tokenizer v1', score: 98.4, accuracy: '99.8%', passRate: '100%', latency: '120ms', status: 'Passed' },
      { runId: 'RUN-TOK-ds1-BPE-1', artifact: 'BPE Tokenizer v1', score: 96.2, accuracy: '99.5%', passRate: '100%', latency: '110ms', status: 'Passed' },
      { runId: 'RUN-CHK-gpt2-base', artifact: 'GPT2 Base Checkpoint', score: 79.5, accuracy: '82.0%', passRate: '78.0%', latency: '1450ms', status: 'Passed' }
    ],
    leaderboard: [
      { rank: 1, artifactId: 'SentencePiece Tokenizer v1', score: 98.4, type: 'tokenizer' },
      { rank: 2, artifactId: 'BPE Tokenizer v1', score: 96.2, type: 'tokenizer' },
      { rank: 3, artifactId: 'GPT2 Base Checkpoint', score: 79.5, type: 'model' }
    ],
    comparison: {
      a1: 'SentencePiece Tokenizer v1',
      a2: 'BPE Tokenizer v1',
      scoreDiff: '+2.2%',
      latencyDiff: '+10ms',
      accuracyDiff: '+0.3%'
    },
    logs: [
      { time: '16:01:00', event: 'Initiated evaluation run (RUN-TOK-ds1-SP-1)', type: 'EvaluationStarted' },
      { time: '16:01:01', event: 'Loaded target SentencePiece Tokenizer v1 parameters', type: 'ArtifactLoaded' },
      { time: '16:01:03', event: 'Aggregated evaluation suite benchmark configurations', type: 'SuiteLoaded' },
      { time: '16:01:05', event: 'Executed Tokenizer speed and coverage benchmarks', type: 'BenchmarkCompleted' },
      { time: '16:01:08', event: 'Aggregated weighted metric scores (98.4% average)', type: 'ScoresAggregated' },
      { time: '16:01:10', event: 'Evaluation report registered successfully', type: 'ResultRegistered' }
    ]
  });

  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setEvalState((prev: any) => ({
        ...prev,
        runs: [
          ...prev.runs,
          { runId: 'RUN-CHK-custom-1', artifact: 'Custom Model Run', score: 85.2, accuracy: '86.5%', passRate: '84.0%', latency: '950ms', status: 'Passed' }
        ],
        leaderboard: [
          { rank: 1, artifactId: 'SentencePiece Tokenizer v1', score: 98.4, type: 'tokenizer' },
          { rank: 2, artifactId: 'BPE Tokenizer v1', score: 96.2, type: 'tokenizer' },
          { rank: 3, artifactId: 'Custom Model Run', score: 85.2, type: 'model' },
          { rank: 4, artifactId: 'GPT2 Base Checkpoint', score: 79.5, type: 'model' }
        ],
        logs: [
          { time: new Date().toLocaleTimeString(), event: 'Evaluated Custom Model Run (85.2%)', type: 'ResultRegistered' },
          ...prev.logs
        ]
      }));
      setIsEvaluating(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 48, 36, 0.96) 0%, rgba(12, 32, 22, 0.98) 100%)',
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
              Evaluation Harness Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T007
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Executing standardized benchmark suites, comparing checkpoints/tokenizers and monitoring historical accuracy trends
          </span>
        </div>

        <div>
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            style={{
              backgroundColor: isEvaluating ? 'rgba(16, 185, 129, 0.5)' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isEvaluating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isEvaluating ? 'Evaluating...' : 'Run Benchmarks'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['runs', 'leaderboard', 'comparison', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#10b981' : '#94a3b8',
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
      {activeTab === 'runs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Completed Evaluation Runs</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {evalState.runs.map((r: any, idx: number) => (
              <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#10b981', fontSize: '12px' }}>{r.artifact}</strong>
                  <span style={{ color: '#64748b' }}>Run ID: {r.runId}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', color: '#cbd5e1' }}>
                  <div>Score: <strong style={{ color: '#10b981' }}>{r.score}%</strong></div>
                  <div>Accuracy: <span style={{ color: '#0ea5e9' }}>{r.accuracy}</span></div>
                  <div>Pass Rate: <span style={{ color: '#eab308' }}>{r.passRate}</span></div>
                  <div>Latency: <span style={{ color: '#a78bfa' }}>{r.latency}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Leaderboard Rankings</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {evalState.leaderboard.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <strong style={{ color: '#eab308', width: '20px' }}>#{item.rank}</strong>
                  <span style={{ color: '#cbd5e1' }}>{item.artifactId}</span>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>{item.type}</span>
                  <strong style={{ color: '#10b981' }}>{item.score}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Artifact Comparison View</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div style={{ color: '#cbd5e1', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              Comparing <strong style={{ color: '#10b981' }}>{evalState.comparison.a1}</strong> vs <strong style={{ color: '#64748b' }}>{evalState.comparison.a2}</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '4px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Score Delta</div>
                <strong style={{ color: '#10b981', fontSize: '12px' }}>{evalState.comparison.scoreDiff}</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Accuracy Delta</div>
                <strong style={{ color: '#10b981', fontSize: '12px' }}>{evalState.comparison.accuracyDiff}</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Latency Delta</div>
                <strong style={{ color: '#ef4444', fontSize: '12px' }}>{evalState.comparison.latencyDiff}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Execution Logs timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {evalState.logs.map((l: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>[{l.time}]</span>
                <span style={{ color: '#cbd5e1' }}>{l.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
