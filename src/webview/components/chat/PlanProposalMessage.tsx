import React, { useState, useEffect } from 'react';
import { ExecutionPlan } from '../../../core/planner/types';
import { ApprovalRequest, ApprovalStatus } from '../../../core/approval/approvalTypes';
import { approvalService } from '../../services/approvalService';

export interface PlanProposalMessageProps {
  plan: ExecutionPlan;
  approval: ApprovalRequest;
}

export function PlanProposalMessage({ 
  plan, 
  approval: initialApproval
}: PlanProposalMessageProps): React.JSX.Element {
  const [approval, setApproval] = useState<ApprovalRequest>(initialApproval);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state if props change
  useEffect(() => {
    setApproval(initialApproval);
  }, [initialApproval]);

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
      </div>
    </div>
  );
}
