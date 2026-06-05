import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const TaskPlannerDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dag' | 'htn' | 'knowledge' | 'constraints' | 'observability'>('dag');

  useEffect(() => {
    const handleTaskGenerationUpdate = (msg: any) => {
      if (msg.type === MessageType.TASK_GENERATION_UPDATE as any) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.TASK_GENERATION_UPDATE as any, handleTaskGenerationUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.TASK_GENERATION_UPDATE as any, handleTaskGenerationUpdate);
    };
  }, []);

  const handleGenerateTasks = () => {
    setLoading(true);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.TASK_GENERATION_REQUEST as any,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE_TASKS'
      },
      version: '1.0.0' as any
    });
  };

  const selectedNode = selectedTaskId && report?.taskGraph?.nodes ? report.taskGraph.nodes[selectedTaskId] : null;
  const intel = report?.intelligence;

  return (
    <div style={{
      backgroundColor: 'var(--vscode-sideBar-background, #252526)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      color: '#d4d4d4',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Task Intelligence Dashboard</h4>
        <button 
          onClick={handleGenerateTasks}
          disabled={loading}
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '11px'
          }}
        >
          {loading ? 'Generating...' : 'Decompose Plan'}
        </button>
      </div>

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Summary Row */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4ec9b0' }}>
                {report.estimatedEffort.totalTasks}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Total Tasks</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#cca700' }}>
                {Math.round(report.estimatedEffort.totalTimeMs / 1000)}s
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Est. Duration</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#9cdcfe' }}>
                {intel?.observability ? `$${intel.observability.estimatedCostUSD}` : report.estimatedEffort.totalTokens}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Est. Cost</div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', overflowX: 'auto' }}>
            {(['dag', 'htn', 'knowledge', 'constraints', 'observability'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#888',
                  border: 'none',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content: DAG */}
          {activeTab === 'dag' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ backgroundColor: 'rgba(204,167,0,0.08)', border: '1px solid #cca700', borderRadius: '4px', padding: '6px 8px', fontSize: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#cca700' }}>Critical Path ({report.taskGraph.criticalPath.length} tasks): </span>
                <span>{report.taskGraph.criticalPath.join(' → ')}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {report.executionOrder.map((tid: string, index: number) => {
                  const isCritical = report.taskGraph.criticalPath.includes(tid);
                  const isSelected = selectedTaskId === tid;
                  return (
                    <button
                      key={tid}
                      onClick={() => setSelectedTaskId(tid)}
                      style={{
                        background: isSelected ? '#007acc' : isCritical ? 'rgba(204,167,0,0.2)' : 'rgba(255,255,255,0.05)',
                        color: isSelected ? '#fff' : isCritical ? '#cca700' : '#ddd',
                        border: `1px solid ${isSelected ? '#007acc' : isCritical ? '#cca700' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '3px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      {index + 1}. {tid}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content: HTN Tree */}
          {activeTab === 'htn' && intel?.htnTree && (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '8px', fontSize: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#4ec9b0' }}>HTN Hierarchy: {intel.htnTree.title}</div>
              <div style={{ marginTop: '4px' }}>
                {intel.htnTree.children.map((msNode: any) => (
                  <div key={msNode.id} style={{ marginLeft: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#cca700', fontWeight: 600 }}>• Milestone {msNode.id}: {msNode.title}</span>
                    {msNode.children.map((tNode: any) => (
                      <div key={tNode.id} style={{ marginLeft: '16px', color: '#ddd' }}>
                        ‣ Task {tNode.id}: {tNode.title} (Pre: {tNode.preconditions.join(', ') || 'None'})
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Knowledge Graph */}
          {activeTab === 'knowledge' && intel?.knowledgeGraph && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              {Object.values(intel.knowledgeGraph).map((meta: any) => (
                <div key={meta.taskId} style={{ backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#9cdcfe' }}>Task {meta.taskId} Knowledge Graph:</div>
                  <div>Files Required: <strong>{meta.requiredFiles.join(', ') || 'None'}</strong></div>
                  <div>Services/APIs: <strong>{meta.services.concat(meta.apis).join(', ') || 'None'}</strong></div>
                  <div>DB Tables: <strong>{meta.databaseTables.join(', ') || 'None'}</strong></div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Constraints & Recovery */}
          {activeTab === 'constraints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              <div style={{ fontWeight: 600, color: '#888' }}>Solvable Task Constraints ({intel?.constraints?.length || 0}):</div>
              {intel?.constraints?.map((cst: any) => (
                <div key={cst.constraintId} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '4px 6px', borderRadius: '3px' }}>
                  <span style={{ color: '#4ec9b0', fontWeight: 'bold' }}>[{cst.type}]</span> {cst.description}
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Observability */}
          {activeTab === 'observability' && intel?.observability && (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Planning Time: <strong>{intel.observability.planningTimeMs} ms</strong></div>
              <div>Scheduling Time: <strong>{intel.observability.schedulingTimeMs} ms</strong></div>
              <div>Parallel Efficiency: <strong>{intel.observability.parallelEfficiencyPercent}%</strong></div>
              <div>Estimated Cost: <strong>${intel.observability.estimatedCostUSD} USD</strong></div>
              <div>Planning Confidence: <strong>{Math.round(intel.observability.planningConfidence * 100)}%</strong></div>
            </div>
          )}

          {/* Selected Task Inspection Panel */}
          {selectedNode && (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 'bold', color: '#4ec9b0' }}>{selectedNode.task.title}</div>
              <div>Type: <strong>{selectedNode.task.taskType}</strong> | Strategy: <strong>{selectedNode.task.executionStrategy}</strong></div>
              <div>Milestone: <strong>{selectedNode.task.parentMilestone}</strong></div>
              <div>Priority: <strong>{selectedNode.task.priority}</strong> | Risk: <strong>{selectedNode.task.risk}</strong></div>
              <div>Decision: <strong style={{ color: '#9cdcfe' }}>{intel?.decisions?.[selectedNode.task.taskId]?.action || 'Parallelize'}</strong></div>
              <div>Recovery Strategy: <strong>{intel?.recoveryPlans?.[selectedNode.task.taskId]?.rollbackStrategy || 'Snapshot Revert'}</strong></div>
              <div>Version: <strong>v{intel?.versions?.[selectedNode.task.taskId]?.version || 1}</strong></div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No task graph generated. Click Decompose Plan to build the DAG execution graph.
        </div>
      )}
    </div>
  );
};
export default TaskPlannerDashboard;
