import React, { useState } from 'react';

export const EarlyStoppingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patience' | 'recommendation' | 'timeline'>('overview');

  // Dashboard interactive state
  const [stopState, setStopState] = useState<any>({
    sessionId: 'SESS-8877',
    trainingStatus: 'Training',
    policy: {
      metric: 'validationLoss',
      patienceWindow: 4,
      mode: 'min',
      minImprovement: 0.001
    },
    decision: {
      decision: 'continue',
      reason: 'Training is progressing normally and metrics are improving.',
      timestamp: Date.now(),
      evaluatedMetricValue: 1.042,
      bestMetricValue: 1.042,
      stepsSinceImprovement: 0
    },
    patienceReport: {
      patienceWindow: 4,
      improvementCount: 5,
      plateauLength: 0,
      metricStability: 0.002,
      bestScore: 1.042,
      lastImprovementStep: 500
    },
    recommendationReport: {
      recommendation: 'Maintain current training settings.',
      severity: 'low',
      confidence: 0.95,
      reasoning: ['Model convergence metrics are within acceptable parameters.'],
      suggestedAction: 'continue'
    },
    timeline: [
      { step: 100, val: 1.250, best: 1.250, decision: 'continue', stepsNoImp: 0 },
      { step: 200, val: 1.180, best: 1.180, decision: 'continue', stepsNoImp: 0 },
      { step: 300, val: 1.120, best: 1.120, decision: 'continue', stepsNoImp: 0 },
      { step: 400, val: 1.097, best: 1.097, decision: 'continue', stepsNoImp: 0 },
      { step: 500, val: 1.042, best: 1.042, decision: 'continue', stepsNoImp: 0 }
    ],
    history: [
      { timeStr: '16:04:12', step: 500, action: 'Early stopping check passed. Decision: CONTINUE. Metric value: 1.042.' },
      { timeStr: '15:49:32', step: 400, action: 'Early stopping check passed. Decision: CONTINUE. Metric value: 1.097.' },
      { timeStr: '15:35:10', step: 300, action: 'Early stopping check passed. Decision: CONTINUE. Metric value: 1.120.' }
    ]
  });

  const [simMode, setSimMode] = useState<'improve' | 'stagnate' | 'overfit'>('improve');

  const handleSimulateStep = () => {
    setStopState((prev: any) => {
      const nextStep = prev.timeline[prev.timeline.length - 1].step + 100;
      let nextVal = prev.decision.evaluatedMetricValue;
      let nextBest = prev.decision.bestMetricValue;
      let stepsNoImp = prev.decision.stepsSinceImprovement;
      
      let decisionType = 'continue';
      let reason = '';
      let recommendation = '';
      let suggestedAction = '';
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let confidence = 0.95;
      const reasoning: string[] = [];
      let trainingStatus = 'Training';

      if (simMode === 'improve') {
        nextVal = parseFloat((prev.decision.bestMetricValue - 0.025).toFixed(4));
        nextBest = nextVal;
        stepsNoImp = 0;
        reason = 'Training is progressing normally and metrics are improving.';
        recommendation = 'Maintain current training settings.';
        suggestedAction = 'continue';
        reasoning.push('Model convergence metrics are within acceptable parameters.');
      } else if (simMode === 'stagnate') {
        nextVal = parseFloat((prev.decision.evaluatedMetricValue + (Math.random() * 0.004 - 0.002)).toFixed(4));
        stepsNoImp += 1;
        
        if (stepsNoImp >= prev.policy.patienceWindow) {
          decisionType = 'stop';
          reason = `Stopping triggered: metric "validationLoss" failed to improve for ${stepsNoImp} consecutive steps (patience window of ${prev.policy.patienceWindow} exceeded).`;
          recommendation = 'Terminate the training run immediately. The metric has stagnated beyond the patience window.';
          suggestedAction = 'stop';
          severity = 'critical';
          confidence = 0.99;
          reasoning.push(`Metric validationLoss exceeded patience limit of ${prev.policy.patienceWindow} steps.`);
          reasoning.push(`No performance improvements registered for the past ${stepsNoImp} evaluations.`);
          trainingStatus = 'Stopped';
        } else if (stepsNoImp % 2 === 0) {
          decisionType = 'checkpoint_and_continue';
          reason = `Patience degradation in progress (${stepsNoImp}/${prev.policy.patienceWindow} steps without improvement). Initiating checkpoint creation.`;
          recommendation = 'Save a recovery checkpoint to prevent loss of progress during metric instability.';
          suggestedAction = 'save_checkpoint';
          severity = 'medium';
          confidence = 0.90;
          reasoning.push(`Metric is plateauing (${stepsNoImp} steps since last improvement).`);
        } else {
          reason = `Metric "validationLoss" did not improve (${stepsNoImp}/${prev.policy.patienceWindow} steps).`;
          recommendation = 'Monitor metrics closely. A validation plateau is forming.';
          suggestedAction = 'monitor';
          severity = 'low';
          confidence = 0.80;
          reasoning.push(`Validation metric flatlined for ${stepsNoImp} steps.`);
        }
      } else { // overfit
        nextVal = parseFloat((prev.decision.evaluatedMetricValue + 0.120).toFixed(4));
        stepsNoImp += 1;
        decisionType = 'require_manual_review';
        reason = `Critical validation divergence detected. Overfitting risk is high; training paused to review hyperparameter settings.`;
        recommendation = 'Decrease the learning rate or increase regularization parameters (dropout, weight decay).';
        suggestedAction = 'pause_and_review';
        severity = 'high';
        confidence = 0.85;
        reasoning.push('Validation loss is increasing while training loss continues to decline.');
        reasoning.push('Significant generalization gap is expanding.');
        trainingStatus = 'Paused';
      }

      const nextDecision = {
        decision: decisionType,
        reason,
        timestamp: Date.now(),
        evaluatedMetricValue: nextVal,
        bestMetricValue: nextBest,
        stepsSinceImprovement: stepsNoImp
      };

      const nextPatienceReport = {
        patienceWindow: prev.policy.patienceWindow,
        improvementCount: simMode === 'improve' ? prev.patienceReport.improvementCount + 1 : prev.patienceReport.improvementCount,
        plateauLength: stepsNoImp,
        metricStability: simMode === 'improve' ? 0.002 : 0.024,
        bestScore: nextBest,
        lastImprovementStep: simMode === 'improve' ? nextStep : prev.patienceReport.lastImprovementStep
      };

      const nextRecommendation = {
        recommendation,
        severity,
        confidence,
        reasoning,
        suggestedAction
      };

      const newTimelineEntry = {
        step: nextStep,
        val: nextVal,
        best: nextBest,
        decision: decisionType,
        stepsNoImp
      };

      const newHistoryEntry = {
        timeStr: new Date().toTimeString().split(' ')[0],
        step: nextStep,
        action: `Step ${nextStep}: Decision: ${decisionType.toUpperCase()}. Value: ${nextVal}, Best: ${nextBest}. Reason: ${reason}`
      };

      return {
        ...prev,
        trainingStatus,
        decision: nextDecision,
        patienceReport: nextPatienceReport,
        recommendationReport: nextRecommendation,
        timeline: [...prev.timeline.slice(1), newTimelineEntry],
        history: [newHistoryEntry, ...prev.history]
      };
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.95) 0%, rgba(10, 12, 16, 0.98) 100%)',
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
              Early Stopping Engine Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              M07-S01-T008
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'inline-block' }}>
            Monitoring training progress, checking patience windows and plateau lengths to enforce stopping policies
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={simMode}
            onChange={(e: any) => setSimMode(e.target.value)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value="improve">Simulate Improvement</option>
            <option value="stagnate">Simulate Stagnation</option>
            <option value="overfit">Simulate Overfitting</option>
          </select>
          <button
            onClick={handleSimulateStep}
            style={{
              backgroundColor: '#e11d48',
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
            Step Decision
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Training Status</div>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: stopState.trainingStatus === 'Stopped' ? '#ef4444' : stopState.trainingStatus === 'Paused' ? '#f59e0b' : '#34d399'
          }}>
            {stopState.trainingStatus.toUpperCase()}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Patience Counter</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: stopState.decision.stepsSinceImprovement >= stopState.policy.patienceWindow ? '#ef4444' : '#cbd5e1' }}>
            {stopState.decision.stepsSinceImprovement} / {stopState.policy.patienceWindow}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Best Val Score</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>{stopState.patienceReport.bestScore}</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Current Metric</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#a78bfa' }}>{stopState.decision.evaluatedMetricValue}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        {(['overview', 'patience', 'recommendation', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: activeTab === tab ? '#f43f5e' : '#94a3b8',
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
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Stopping Decision Reasoning</span>
            <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
              <strong>Decision: </strong>
              <span style={{
                color: stopState.decision.decision === 'stop' ? '#ef4444' : stopState.decision.decision === 'pause' ? '#f59e0b' : stopState.decision.decision === 'checkpoint_and_continue' ? '#38bdf8' : '#34d399',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {stopState.decision.decision}
              </span>
              <p style={{ margin: '8px 0 0 0' }}>{stopState.decision.reason}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patience' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Patience Telemetry Audit</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Patience Window Size:</span>
                <strong>{stopState.patienceReport.patienceWindow} steps</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Improvement Count:</span>
                <strong style={{ color: '#34d399' }}>{stopState.patienceReport.improvementCount} times</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Plateau Length:</span>
                <strong style={{ color: stopState.patienceReport.plateauLength > 0 ? '#f59e0b' : '#cbd5e1' }}>{stopState.patienceReport.plateauLength} steps</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Metric Stability (Std Dev):</span>
                <strong style={{ color: '#a78bfa' }}>{stopState.patienceReport.metricStability}</strong>
              </div>
            </div>
            <div style={{ marginTop: '14px', fontSize: '12px', color: '#94a3b8' }}>
              Last improvement recorded at training step <strong>{stopState.patienceReport.lastImprovementStep}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px',
            backgroundColor: stopState.recommendationReport.severity === 'critical' ? 'rgba(239, 68, 68, 0.05)' : stopState.recommendationReport.severity === 'high' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(56, 189, 248, 0.05)',
            border: stopState.recommendationReport.severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.2)' : stopState.recommendationReport.severity === 'high' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>Advisor Recommendation</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 600,
                backgroundColor: stopState.recommendationReport.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                color: stopState.recommendationReport.severity === 'critical' ? '#ef4444' : '#cbd5e1'
              }}>
                SEVERITY: {stopState.recommendationReport.severity.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#cbd5e1' }}>
              {stopState.recommendationReport.recommendation}
            </p>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Confidence Level: <strong>{(stopState.recommendationReport.confidence * 100).toFixed(0)}%</strong> | Suggested Action: <strong style={{ color: '#38bdf8' }}>{stopState.recommendationReport.suggestedAction}</strong>
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Detailed Diagnostic Items</span>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stopState.recommendationReport.reasoning.map((reason: string, idx: number) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Decision Event Log Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {stopState.timeline.map((t: any, idx: number) => (
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
                <span>Value: <span style={{ color: '#f43f5e', fontWeight: 600 }}>{t.val}</span></span>
                <span>Best: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{t.best}</span></span>
                <span>Stagnant Steps: <strong style={{ color: t.stepsNoImp > 0 ? '#f59e0b' : '#94a3b8' }}>{t.stepsNoImp}</strong></span>
                <span style={{
                  color: t.decision === 'stop' ? '#ef4444' : t.decision === 'pause' ? '#f59e0b' : t.decision === 'checkpoint_and_continue' ? '#38bdf8' : '#34d399',
                  backgroundColor: t.decision === 'stop' ? 'rgba(239, 68, 68, 0.1)' : t.decision === 'pause' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 600
                }}>
                  {t.decision.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EarlyStoppingDashboard;
