import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const PromptInspector: React.FC = () => {
  const [pkg, setPkg] = useState<any | null>(null);
  const [promptType, setPromptType] = useState<string>('Code Generation');
  const [userInput, setUserInput] = useState<string>('Create a new workspace configurations validator');
  const [tokenLimit, setTokenLimit] = useState<number>(2000);

  useEffect(() => {
    const handlePromptAssemblyUpdate = (msg: any) => {
      if (msg.type === MessageType.PROMPT_ASSEMBLY_UPDATE) {
        const { promptPackage } = msg.payload || {};
        if (promptPackage) {
          setPkg(promptPackage);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.PROMPT_ASSEMBLY_UPDATE, handlePromptAssemblyUpdate);

    return () => {
      vscodeBridge.unsubscribe(MessageType.PROMPT_ASSEMBLY_UPDATE, handlePromptAssemblyUpdate);
    };
  }, []);

  const handleAssemblePrompt = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PROMPT_ASSEMBLY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ASSEMBLE',
        request: {
          prompt: userInput,
          type: promptType as any,
          workspaceSummary: 'Kaira AI extension codebase with core engines.',
          gitSummary: 'Changes in context resolver and metadata filters.',
          diagnostics: ['Warning: Duplicate key index.json'],
          tokenLimit: tokenLimit,
          retrievedContext: {
            files: [
              { filePath: 'src/core/context/contextValidator.ts', language: 'TypeScript', size: 1024 },
              { filePath: 'src/core/indexer/indexValidator.ts', language: 'TypeScript', size: 2048 }
            ],
            symbols: [
              { name: 'validateRequest', type: 'Method', filePath: 'src/core/retriever/retrievalValidator.ts', line: 10 }
            ],
            dependencies: [],
            configs: [],
            documentation: [],
            confidenceScore: 0.95
          }
        }
      },
      version: '1.0.0' as any
    });
  };

  const handleInvalidateCache = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PROMPT_ASSEMBLY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'INVALIDATE_CACHE' },
      version: '1.0.0' as any
    });
    setPkg(null);
  };

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Prompt Assembly Inspector</h4>
        <button 
          onClick={handleInvalidateCache}
          style={{ background: 'var(--vscode-button-secondaryBackground, #3c3c3c)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
        >
          Invalidate Cache
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="User prompt instruction..."
          style={{ backgroundColor: 'var(--vscode-input-background, #3c3c3c)', color: '#fff', border: '1px solid var(--border)', borderRadius: '3px', padding: '3px 6px', fontSize: '11px' }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          <select 
            value={promptType}
            onChange={(e) => setPromptType(e.target.value)}
            style={{ flex: 1, backgroundColor: 'var(--vscode-dropdown-background, #3c3c3c)', color: '#fff', border: '1px solid var(--border)', borderRadius: '3px', padding: '2px 4px', fontSize: '11px' }}
          >
            <option value="Code Generation">Code Gen</option>
            <option value="Bug Fixing">Bug Fixing</option>
            <option value="Explanation">Explanation</option>
            <option value="Refactoring">Refactoring</option>
            <option value="Testing">Testing</option>
            <option value="Architecture Review">Arch Review</option>
            <option value="Documentation">Documentation</option>
          </select>
          <input 
            type="number"
            value={tokenLimit}
            onChange={(e) => setTokenLimit(Number(e.target.value))}
            placeholder="Token Limit"
            style={{ width: '80px', backgroundColor: 'var(--vscode-input-background, #3c3c3c)', color: '#fff', border: '1px solid var(--border)', borderRadius: '3px', padding: '3px 6px', fontSize: '11px' }}
          />
          <button 
            onClick={handleAssemblePrompt}
            style={{ background: 'var(--vscode-button-background)', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            Assemble
          </button>
        </div>
      </div>

      {pkg ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Assembly Metrics</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div>Prompt Type: <strong style={{ color: '#4ec9b0' }}>{pkg.metadata.promptType}</strong></div>
              <div>Estimated Tokens: <strong style={{ color: '#d7ba7d' }}>{pkg.estimatedTokens}</strong></div>
              <div>Compression Ratio: <span>{(pkg.metadata.compressionRatio * 100).toFixed(0)}%</span></div>
              <div>Context Sources: <span>{pkg.metadata.sourcesCount}</span></div>
            </div>
          </div>

          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Prompt Preview</h5>
            <div style={{
              maxHeight: '120px',
              overflowY: 'auto',
              padding: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '3px',
              fontSize: '10px',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div>
                <span style={{ color: '#4ec9b0' }}>[System Prompt]</span>
                <div style={{ opacity: 0.8, marginTop: '2px' }}>{pkg.systemPrompt}</div>
              </div>
              <div>
                <span style={{ color: '#4ec9b0' }}>[Developer Prompt]</span>
                <div style={{ opacity: 0.8, marginTop: '2px' }}>{pkg.developerPrompt}</div>
              </div>
              <div>
                <span style={{ color: '#4ec9b0' }}>[User Prompt]</span>
                <div style={{ opacity: 0.8, marginTop: '2px' }}>{pkg.userPrompt}</div>
              </div>
              <div>
                <span style={{ color: '#4ec9b0' }}>[Project Context]</span>
                <pre style={{ margin: '2px 0 0 0', opacity: 0.7, whiteSpace: 'pre-wrap', fontSize: '9px' }}>{pkg.projectContext}</pre>
              </div>
              <div>
                <span style={{ color: '#4ec9b0' }}>[Retrieved Context]</span>
                <pre style={{ margin: '2px 0 0 0', opacity: 0.7, whiteSpace: 'pre-wrap', fontSize: '9px' }}>{pkg.retrievedContext}</pre>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '8px', opacity: 0.6, fontStyle: 'italic' }}>
          <span>No prompt assembled yet</span>
        </div>
      )}
    </div>
  );
};
