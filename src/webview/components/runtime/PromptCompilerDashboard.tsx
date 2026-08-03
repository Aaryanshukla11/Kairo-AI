import React, { useState } from 'react';

export const PromptCompilerDashboard: React.FC = () => {
  const [report, setReport] = useState<any>({
    templateUsed: 'Coding Template',
    compressionRatio: 0.81,
    tokenUsage: {
      total: 2150,
      system: 350,
      user: 100,
      context: 1700
    },
    optimizationSummary: {
      removedDuplicates: 3,
      mergedContexts: 2,
      formattedOk: true
    },
    compiledSections: [
      { name: 'System Instructions', size: 350, color: '#6366f1' },
      { name: 'Developer Instructions', size: 200, color: '#38bdf8' },
      { name: 'Workspace Diffs Context', size: 1500, color: '#10b981' },
      { name: 'User Request Prompt', size: 100, color: '#f59e0b' }
    ],
    preview: `You are Kaira-AI Software Engineer. Write high-quality, dry, type-safe, and secure code blocks.

Developer Instructions:
Embed code inside typescript markdown fence blocks. Clean up duplicate symbol names.

=== CONTEXT INJECTED ===
=== SOURCE: WORKSPACE [ID: work-0] ===
File contents of main.ts: mock contents for workspace intelligence parsing.

User Request:
Write a binary search algorithm in TypeScript.`
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 48, 0.9) 0%, rgba(20, 20, 38, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Prompt Compiler Dashboard</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Template Engine & Instruction Optimizer</span>
        </div>
        <span style={{
          fontSize: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          Optimized
        </span>
      </div>

      {/* Grid Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Template Used</span>
          <strong style={{ fontSize: '11px', color: '#cbd5e1' }}>{report.templateUsed}</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Compression Ratio</span>
          <strong style={{ fontSize: '13px', color: '#10b981' }}>{report.compressionRatio * 100}%</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Total Tokens</span>
          <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{report.tokenUsage.total} tok</strong>
        </div>
      </div>

      {/* Compiled Sections Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Compiled Sections Breakdown</span>
        <div style={{ display: 'flex', gap: '4px', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
          {report.compiledSections.map((sec: any) => (
            <div
              key={sec.name}
              style={{
                width: `${(sec.size / report.tokenUsage.total) * 100}%`,
                height: '100%',
                backgroundColor: sec.color
              }}
              title={`${sec.name}: ${sec.size} tokens`}
            ></div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {report.compiledSections.map((sec: any) => (
            <div key={sec.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sec.color }}></span>
              <span style={{ color: '#cbd5e1' }}>{sec.name} ({sec.size} tok)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimizations Log */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '11px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ fontWeight: 600, color: '#a5b4fc', marginBottom: '2px' }}>Optimization Summary</div>
        <div>• Removed duplicates: <strong style={{ color: '#10b981' }}>{report.optimizationSummary.removedDuplicates} instructions</strong></div>
        <div>• Merged context repeats: <strong style={{ color: '#10b981' }}>{report.optimizationSummary.mergedContexts} sections</strong></div>
        <div>• Format normalization: <strong style={{ color: '#10b981' }}>Passed</strong></div>
      </div>

      {/* Prompt Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Assembled Compiled Prompt Preview</span>
        <div style={{
          maxHeight: '140px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          fontFamily: 'Fira Code, Consolas, Monaco, monospace',
          fontSize: '11px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          color: '#e2e8f0'
        }}>
          {report.preview}
        </div>
      </div>
    </div>
  );
};
