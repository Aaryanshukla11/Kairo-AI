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

  useEffect(() => {
    setApproval(initialApproval);
  }, [initialApproval]);

  const currentStatusStr = String(approval?.status || 'Pending');
  const normalizedStatus = currentStatusStr.toLowerCase();
  const isPending = !approval?.status || ['pending', 'created', 'waiting'].includes(normalizedStatus);
  const isApproved = normalizedStatus === 'approved';
  const isRejected = normalizedStatus === 'rejected';

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!isPending) return;
    
    setIsProcessing(true);
    try {
      const updatedApproval = await approvalService.submitAction(approval?.id || plan.id, action);
      if (updatedApproval) {
        setApproval(updatedApproval);
      } else {
        setApproval(prev => ({ ...prev, status: action === 'approve' ? ApprovalStatus.Approved : ApprovalStatus.Rejected }));
      }
    } catch (error) {
      console.error('Failed to process approval action:', error);
      setApproval(prev => ({ ...prev, status: action === 'approve' ? ApprovalStatus.Approved : ApprovalStatus.Rejected }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="message-container system-message" style={{ margin: '12px 0' }}>
      <div className="message-content" style={{
        borderLeft: '3px solid #58a6ff',
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '14px 16px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#f0f6fc', fontSize: '15px' }}>
          Execution Plan: {plan.title}
        </h3>
        <p style={{ margin: '0 0 12px 0', color: '#8b949e', fontSize: '13px', lineHeight: '1.4' }}>
          {plan.summary}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '12px', color: '#c9d1d9' }}>
          <div><strong>Estimated Files:</strong> {plan.estimatedFiles}</div>
          <div><strong>Estimated Steps:</strong> {plan.estimatedSteps}</div>
          <div><strong>Risk Level:</strong> <span style={{ color: plan.riskLevel === 'HIGH' ? '#f85149' : '#d29922' }}>{plan.riskLevel}</span></div>
          <div>
            <strong>Status:</strong>{' '}
            <span style={{
              fontWeight: 600,
              color: isApproved ? '#3fb950' : isRejected ? '#f85149' : '#58a6ff'
            }}>
              {isApproved ? '✓ Approved' : isRejected ? '❌ Rejected' : 'Pending Approval'}
            </span>
          </div>
        </div>

        {isPending && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button 
              onClick={() => handleAction('approve')} 
              disabled={isProcessing}
              style={{
                backgroundColor: '#238636',
                color: '#ffffff',
                border: '1px solid rgba(240, 246, 252, 0.1)',
                padding: '6px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: isProcessing ? 'wait' : 'pointer',
                opacity: isProcessing ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isProcessing ? '⟳ Approving...' : '✓ Approve & Execute'}
            </button>
            <button 
              onClick={() => handleAction('reject')} 
              disabled={isProcessing}
              style={{
                backgroundColor: '#21262d',
                color: '#f85149',
                border: '1px solid #30363d',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: isProcessing ? 'wait' : 'pointer',
                opacity: isProcessing ? 0.7 : 1
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
