import React, { useState, useEffect } from 'react';
import { ExecutionPlan } from '../../../core/planner/types';
import { ApprovalRequest, ApprovalStatus } from '../../../core/approval/approvalTypes';
import { approvalService } from '../../services/approvalService';
import { ExecutionTimeline } from '../execution/ExecutionTimeline';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export interface PlanProposalMessageProps {
  plan: ExecutionPlan;
  approval: ApprovalRequest;
  timeline?: any;
  executionProgress?: any;
}

export function PlanProposalMessage({ 
  plan, 
  approval: initialApproval, 
  timeline: initialTimeline,
  executionProgress: initialExecutionProgress
}: PlanProposalMessageProps): React.JSX.Element {
  const [approval, setApproval] = useState<ApprovalRequest>(initialApproval);
  const [timeline, setTimeline] = useState<any>(initialTimeline);
  const [executionProgress, setExecutionProgress] = useState<any>(initialExecutionProgress);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state if props change
  useEffect(() => {
    setApproval(initialApproval);
  }, [initialApproval]);

  useEffect(() => {
    setTimeline(initialTimeline);
  }, [initialTimeline]);

  useEffect(() => {
    setExecutionProgress(initialExecutionProgress);
  }, [initialExecutionProgress]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (approval.status !== ApprovalStatus.Pending) return;
    
    setIsProcessing(true);
    try {
      const updatedApproval = await approvalService.submitAction(approval.id, action);
      setApproval(updatedApproval);
    } catch (error) {
      console.error('Failed to process approval action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecutionControl = (action: 'PAUSE' | 'RESUME' | 'CANCEL') => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.EXECUTION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action },
      version: '1.0.0' as any
    });
  };

  return (
    <div className="message-container system-message">
      <div className="message-content" style={{ borderLeft: '3px solid var(--vscode-charts-blue)', paddingLeft: '12px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Execution Plan: {plan.title}</h3>
        <p style={{ margin: '0 0 12px 0', opacity: 0.8 }}>{plan.summary}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '12px' }}>
          <div><strong>Estimated Files:</strong> {plan.estimatedFiles}</div>
          <div><strong>Estimated Steps:</strong> {plan.estimatedSteps}</div>
          <div><strong>Risk Level:</strong> {plan.riskLevel}</div>
          <div><strong>Status:</strong> {approval.status}</div>
        </div>

        {approval.status === ApprovalStatus.Pending && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handleAction('approve')} 
              disabled={isProcessing}
              style={{
                background: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Approve
            </button>
            <button 
              onClick={() => handleAction('reject')} 
              disabled={isProcessing}
              style={{
                background: 'var(--vscode-errorForeground)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reject
            </button>
          </div>
        )}

        {approval.status === ApprovalStatus.Approved && timeline && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>Timeline execution:</h4>
            <ExecutionTimeline steps={timeline.steps} />

            {executionProgress && (
              <div style={{
                marginTop: '16px',
                backgroundColor: 'var(--vscode-sideBar-background, #252526)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px'
              }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Execution Status</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.8 }}>Status:</span>
                    <strong style={{
                      color: executionProgress.status === 'Completed' ? 'var(--success)' : 
                             executionProgress.status === 'Failed' ? 'var(--error)' : 
                             executionProgress.status === 'Paused' ? 'var(--warning)' : 
                             'var(--vscode-charts-blue)'
                    }}>{executionProgress.status}</strong>
                  </div>
                  
                  {executionProgress.currentStepTitle && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.8 }}>Current Step:</span>
                      <strong>{executionProgress.currentStepTitle}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.8 }}>Completed Steps:</span>
                    <strong>{executionProgress.completedSteps} / {executionProgress.totalSteps}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.8 }}>Remaining Steps:</span>
                    <strong>{executionProgress.remainingSteps}</strong>
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ opacity: 0.8 }}>Progress:</span>
                      <strong>{executionProgress.progressPercent}%</strong>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      backgroundColor: 'var(--border)', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${executionProgress.progressPercent}%`, 
                        height: '100%', 
                        backgroundColor: 'var(--success)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Execution Control Toolbar */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {(executionProgress.status === 'Running' || executionProgress.status === 'Preparing' || executionProgress.status === 'Queued') && (
                      <button 
                        onClick={() => handleExecutionControl('PAUSE')}
                        style={{
                          background: 'var(--vscode-button-secondaryBackground, #3c3c3c)',
                          color: 'var(--vscode-button-secondaryForeground, #fff)',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Pause
                      </button>
                    )}
                    
                    {executionProgress.status === 'Paused' && (
                      <button 
                        onClick={() => handleExecutionControl('RESUME')}
                        style={{
                          background: 'var(--vscode-button-background)',
                          color: 'var(--vscode-button-foreground)',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Resume
                      </button>
                    )}

                    {(executionProgress.status === 'Running' || executionProgress.status === 'Paused') && (
                      <button 
                        onClick={() => handleExecutionControl('CANCEL')}
                        style={{
                          background: 'var(--vscode-errorForeground, #f85149)',
                          color: 'var(--vscode-button-foreground, #fff)',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ 
              marginTop: '16px',
              backgroundColor: 'var(--vscode-sideBar-background, #252526)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px'
            }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Execution Graph</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Nodes:</span>
                  <strong>{plan.tasks.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Dependencies:</span>
                  <strong>{plan.tasks.reduce((sum, t) => sum + (t.dependencies?.length || 0), 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.8 }}>Execution Order:</span>
                  <strong>Sequential</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
