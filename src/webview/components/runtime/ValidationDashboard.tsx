import React, { useState } from 'react';

export const ValidationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'overfitting' | 'timeline'>('overview');

  // Dashboard mock state
  const [valState, setValState] = useState<any>({
    reportId: 'REP-VAL-SESS-9900-10948592',
    sessionId: 'SESS-9900',
    mode: 'fixed_interval',
    isValid: true,
    metrics: {
      validationLoss: 1.052,
      accuracy: 0.854,
      perplexity: 2.863,
      passRate: 0.982,
      inferenceTimeMs: 145.2,
      tokensPerSec: 1542.5,
      memoryUsageMB: 2854.0,
      benchmarkScore: 84.5
    },
    overfittingReport: {
      lossDivergence: false,
      accuracyDegradation: false,
      validationPlateau: false,
      metricInstability: false,
      generalizationGap: false,
      generalizationGapValue: 0.124,
      severity: 'none',
      issues: []
    },
    comparison: {
      currentCheckpointId: 'CHK-STEP-500',
      baselineCheckpointId: 'CHK-STEP-400',
      lossDelta: -0.045,
      accuracyDelta: 0.012,
      perplexityDelta: -0.125,
      benchmarkScoreDelta: 2.3,
      isBetter: true,
      notes: 'New checkpoint CHK-STEP-500 outperforms baseline CHK-STEP-400. Loss decreased by 0.045, accuracy improved by 0.012.'
    },
    timeline: [
      { step: 100, loss: 1.250, accuracy: 0.810, perplexity: 3.490, overfitting: 'none' },
      { step: 200, loss: 1.180, accuracy: 0.825, perplexity: 3.254, overfitting: 'none' },
      { step: 300, loss: 1.120, accuracy: 0.840, perplexity: 3.064, overfitting: 'none' },
      { step: 400, loss: 1.097, accuracy: 0.842, perplexity: 2.994, overfitting: 'none' },
      { step: 500, loss: 1.052, accuracy: 0.854, perplexity: 2.863, overfitting: 'none' }
    ],
    history: [
      { timeStr: '15:10:02', step: 500, action: 'Validation check passed at step 500. Loss: 1.052, Accuracy: 0.854, baseline comparison: IMPROVED.' },
      { timeStr: '14:55:12', step: 400, action: 'Validation check passed at step 400. Loss: 1.097, Accuracy: 0.842, baseline comparison: IMPROVED.' },
      { timeStr: '14:40:24', step: 300, action: 'Validation check passed at step 300. Loss: 1.120, Accuracy: 0.840, baseline comparison: IMPROVED.' }
    ]
  });

  const [simOverfitting, setSimOverfitting] = useState<boolean>(false);

  const handleSimulateValidation = () => {
    setValState((prev: any) => {
      const nextStep = prev.timeline[prev.timeline.length - 1].step + 100;
      
      // Determine new metrics depending on simulated overfitting state
      let newLoss, newAccuracy, newPerplexity;
      let newOverfittingReport: any = { ...prev.overfittingReport };
      
      if (simOverfitting) {
        // Validation loss goes up, training loss keeps dropping
        newLoss = parseFloat((prev.metrics.validationLoss + 0.120).toFixed(4));
        newAccuracy = parseFloat((prev.metrics.accuracy - 0.015).toFixed(4));
        newPerplexity = parseFloat((prev.metrics.perplexity + 0.350).toFixed(4));
        
        newOverfittingReport = {
          lossDivergence: true,
          accuracyDegradation: true,
          validationPlateau: false,
          metricInstability: false,
          generalizationGap: true,
          generalizationGapValue: 0.654,
          severity: 'critical',
          issues: [
            'Loss divergence detected! Validation loss is increasing while training loss continues to decrease.',
            'Accuracy degradation! Validation accuracy has declined.',
            'Large generalization gap detected. Validation loss is significantly higher than training loss.'
          ]
        };
      } else {
        // Continuing healthy convergence
        newLoss = parseFloat((prev.metrics.validationLoss - 0.022).toFixed(4));
        newAccuracy = parseFloat((prev.metrics.accuracy + 0.005).toFixed(4));
        newPerplexity = parseFloat((prev.metrics.perplexity - 0.065).toFixed(4));
        
        newOverfittingReport = {
          lossDivergence: false,
          accuracyDegradation: false,
          validationPlateau: false,
          metricInstability: false,
          generalizationGap: false,
          generalizationGapValue: 0.098,
          severity: 'none',
          issues: []
        };
      }

      const nextBenchmarkScore = parseFloat((prev.metrics.benchmarkScore + (simOverfitting ? -2.5 : 1.2)).toFixed(2));
      const nextPassRate = parseFloat((prev.metrics.passRate + (simOverfitting ? -0.01 : 0.002)).toFixed(4));

      const newMetrics = {
        ...prev.metrics,
        validationLoss: newLoss,
        accuracy: newAccuracy,
        perplexity: newPerplexity,
        passRate: nextPassRate,
        benchmarkScore: nextBenchmarkScore
      };

      const newComparison = {
        currentCheckpointId: `CHK-STEP-${nextStep}`,
        baselineCheckpointId: prev.comparison.currentCheckpointId,
        lossDelta: parseFloat((newLoss - prev.metrics.validationLoss).toFixed(4)),
        accuracyDelta: parseFloat((newAccuracy - prev.metrics.accuracy).toFixed(4)),
        perplexityDelta: parseFloat((newPerplexity - prev.metrics.perplexity).toFixed(4)),
        benchmarkScoreDelta: parseFloat((nextBenchmarkScore - prev.metrics.benchmarkScore).toFixed(2)),
        isBetter: !simOverfitting,
        notes: simOverfitting 
          ? `New checkpoint CHK-STEP-${nextStep} performs worse than baseline. Loss increased by ${parseFloat((newLoss - prev.metrics.validationLoss).toFixed(4))}.`
          : `New checkpoint CHK-STEP-${nextStep} outperforms baseline. Loss decreased by ${Math.abs(parseFloat((newLoss - prev.metrics.validationLoss).toFixed(4)))}.`
      };

      const newTimelineEntry = {
        step: nextStep,
        loss: newLoss,
        accuracy: newAccuracy,
        perplexity: newPerplexity,
        overfitting: newOverfittingReport.severity
      };

      const newHistoryEntry = {
        timeStr: new Date().toTimeString().split(' ')[0],
        step: nextStep,
        action: `Validation step ${nextStep} executed. Mode: ${prev.mode}. Loss: ${newLoss}, Accuracy: ${newAccuracy}, Overfitting: ${newOverfittingReport.severity}.`
      };

      return {
        ...prev,
        metrics: newMetrics,
        overfittingReport: newOverfittingReport,
        comparison: newComparison,
        timeline: [...prev.timeline.slice(1), newTimelineEntry],
        history: [newHistoryEntry, ...prev.history],
        isValid: !newOverfittingReport.lossDivergence
      };
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 28, 48, 0.95) 0%, rgba(8, 12, 24, 0.98) 100%)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '24px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
              Validation Loop Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              M07-S01-T007
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'inline-block' }}>
            Orchestrating model validation passes, evaluation metrics collection, overfitting detection, and checkpoint comparisons
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={simOverfitting}
              onChange={(e) => setSimOverfitting(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Simulate Overfitting
          </label>
          <button
            onClick={handleSimulateValidation}
            style={{
              backgroundColor: '#0284c7',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Trigger Validation
          </button>
        </div>
      </div>

      {/* Main Telemetry Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Validation Loss</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>{valState.metrics.validationLoss}</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Accuracy</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>{(valState.metrics.accuracy * 100).toFixed(1)}%</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Perplexity</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#a78bfa' }}>{valState.metrics.perplexity}</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Overfitting Risk</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: valState.overfittingReport.severity === 'critical' ? '#ef4444' : valState.overfittingReport.severity === 'high' ? '#f59e0b' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '33px'
          }}>
            {valState.overfittingReport.severity === 'critical' ? '● CRITICAL' : valState.overfittingReport.severity === 'high' ? '● HIGH' : '● STABLE'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        {(['overview', 'comparison', 'overfitting', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: activeTab === tab ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Secondary Metrics */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Validation Run Quality Details</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '13px' }}>
              <div>Pass Rate: <strong style={{ color: '#cbd5e1' }}>{(valState.metrics.passRate * 100).toFixed(1)}%</strong></div>
              <div>Inference Latency: <strong style={{ color: '#cbd5e1' }}>{valState.metrics.inferenceTimeMs} ms</strong></div>
              <div>Throughput: <strong style={{ color: '#cbd5e1' }}>{valState.metrics.tokensPerSec} tok/s</strong></div>
              <div>Memory Peak: <strong style={{ color: '#cbd5e1' }}>{valState.metrics.memoryUsageMB} MB</strong></div>
            </div>
          </div>

          {/* Benchmark block */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600, display: 'block' }}>Benchmark Score</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Averaged weighted score across coding, reasoning, and tokenizer parameters benchmarks</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>{valState.metrics.benchmarkScore}</div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Checkpoint Performance Deltas</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>Current Checkpoint: <strong style={{ color: '#38bdf8' }}>{valState.comparison.currentCheckpointId}</strong></div>
              <div>Baseline Checkpoint: <strong style={{ color: '#64748b' }}>{valState.comparison.baselineCheckpointId}</strong></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Loss Delta</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: valState.comparison.lossDelta < 0 ? '#34d399' : '#ef4444' }}>
                  {valState.comparison.lossDelta > 0 ? `+${valState.comparison.lossDelta}` : valState.comparison.lossDelta}
                </div>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Accuracy Delta</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: valState.comparison.accuracyDelta >= 0 ? '#34d399' : '#ef4444' }}>
                  {valState.comparison.accuracyDelta > 0 ? `+${valState.comparison.accuracyDelta}` : valState.comparison.accuracyDelta}
                </div>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Perplexity Delta</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: valState.comparison.perplexityDelta < 0 ? '#34d399' : '#ef4444' }}>
                  {valState.comparison.perplexityDelta > 0 ? `+${valState.comparison.perplexityDelta}` : valState.comparison.perplexityDelta}
                </div>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Benchmark Score Delta</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: valState.comparison.benchmarkScoreDelta >= 0 ? '#34d399' : '#ef4444' }}>
                  {valState.comparison.benchmarkScoreDelta > 0 ? `+${valState.comparison.benchmarkScoreDelta}` : valState.comparison.benchmarkScoreDelta}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', backgroundColor: valState.comparison.isBetter ? 'rgba(52, 211, 153, 0.04)' : 'rgba(239, 68, 68, 0.04)', border: valState.comparison.isBetter ? '1px solid rgba(52, 211, 153, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', fontSize: '12px', color: '#cbd5e1' }}>
            <strong>Status Check: </strong> {valState.comparison.notes}
          </div>
        </div>
      )}

      {activeTab === 'overfitting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Generalization & Divergence Auditor</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Loss Divergence:</span>
                <strong style={{ color: valState.overfittingReport.lossDivergence ? '#ef4444' : '#34d399' }}>{valState.overfittingReport.lossDivergence ? 'TRIGGERED' : 'CLEAN'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Accuracy Degradation:</span>
                <strong style={{ color: valState.overfittingReport.accuracyDegradation ? '#ef4444' : '#34d399' }}>{valState.overfittingReport.accuracyDegradation ? 'TRIGGERED' : 'CLEAN'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Validation Plateau:</span>
                <strong style={{ color: valState.overfittingReport.validationPlateau ? '#f59e0b' : '#34d399' }}>{valState.overfittingReport.validationPlateau ? 'PLATEAUED' : 'CONVERGING'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Metric Instability:</span>
                <strong style={{ color: valState.overfittingReport.metricInstability ? '#f59e0b' : '#34d399' }}>{valState.overfittingReport.metricInstability ? 'UNSTABLE' : 'STABLE'}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', marginTop: '10px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span>Generalization Gap (Val loss - Train loss):</span>
              <strong style={{ color: valState.overfittingReport.generalizationGap ? '#ef4444' : '#34d399' }}>{valState.overfittingReport.generalizationGapValue}</strong>
            </div>
          </div>

          {valState.overfittingReport.issues.length > 0 && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Alerts Generated</span>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {valState.overfittingReport.issues.map((issue: string, idx: number) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Validation History Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {valState.timeline.map((t: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <span>Step <strong style={{ color: '#f8fafc' }}>{t.step}</strong></span>
                <span>Loss: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{t.loss}</span></span>
                <span>Accuracy: <span style={{ color: '#34d399', fontWeight: 600 }}>{(t.accuracy * 100).toFixed(1)}%</span></span>
                <span>Perplexity: <span style={{ color: '#a78bfa', fontWeight: 600 }}>{t.perplexity}</span></span>
                <span style={{
                  color: t.overfitting === 'critical' ? '#ef4444' : t.overfitting === 'high' ? '#f59e0b' : '#34d399',
                  backgroundColor: t.overfitting === 'critical' ? 'rgba(239, 68, 68, 0.1)' : t.overfitting === 'high' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 600
                }}>
                  {t.overfitting.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationDashboard;
