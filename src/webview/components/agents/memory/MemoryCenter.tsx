import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const MemoryCenter: React.FC = () => {
  const [memories, setMemories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Architecture Decision');
  const [importance, setImportance] = useState(5);
  const [tagsStr, setTagsStr] = useState('');
  const [filesStr, setFilesStr] = useState('');

  useEffect(() => {
    const handleMemoryUpdate = (msg: any) => {
      if (msg.type === MessageType.MEMORY_UPDATE) {
        const payload = msg.payload || {};
        if (payload.memories) {
          setMemories(payload.memories);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.MEMORY_UPDATE, handleMemoryUpdate);
    
    // Request initial list
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MEMORY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_ALL' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.MEMORY_UPDATE, handleMemoryUpdate);
    };
  }, []);

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and Content are required.');
      return;
    }
    setErrorMsg('');

    const newMemory = {
      id: `mem-${Date.now()}`,
      type,
      title,
      summary,
      content,
      importance,
      tags: tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0),
      relatedFiles: filesStr.split(',').map(f => f.trim()).filter(f => f.length > 0),
      relatedTasks: [],
      relatedCommits: []
    };

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MEMORY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'CREATE',
        memory: newMemory
      },
      version: '1.0.0' as any
    });

    // Reset Form
    setTitle('');
    setSummary('');
    setContent('');
    setTagsStr('');
    setFilesStr('');
  };

  const handleDeleteMemory = (id: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MEMORY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'DELETE',
        id
      },
      version: '1.0.0' as any
    });
  };

  const handleCompress = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MEMORY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'COMPRESS'
      },
      version: '1.0.0' as any
    });
  };

  // Compute search & filtering on frontend
  const filteredMemories = memories.filter(mem => {
    const matchesQuery = searchQuery
      ? mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mem.tags && mem.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
      : true;

    const matchesType = filterType ? mem.type === filterType : true;

    const matchesTag = filterTag
      ? mem.tags && mem.tags.some((t: string) => t.toLowerCase().trim() === filterTag.toLowerCase().trim())
      : true;

    return matchesQuery && matchesType && matchesTag;
  });

  const recentMemories = [...filteredMemories].sort((a, b) => b.updatedAt - a.updatedAt);
  const allTags = Array.from(new Set(memories.flatMap(m => m.tags || [])));

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
      gap: '16px',
      textAlign: 'left'
    }}>
      {/* Title Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Memory Center</h4>
        <button 
          onClick={handleCompress}
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Compress Logs
        </button>
      </div>

      {/* Stats Counter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#4ec9b0' }}>{memories.length}</div>
          <div style={{ fontSize: '9px', color: '#888' }}>Total</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#569cd6' }}>{memories.filter(m => m.type === 'Architecture Decision').length}</div>
          <div style={{ fontSize: '9px', color: '#888' }}>Decisions</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#cca700' }}>{memories.filter(m => m.type === 'Execution Summary').length}</div>
          <div style={{ fontSize: '9px', color: '#888' }}>Executions</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input 
          type="text" 
          placeholder="Search memories..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'var(--vscode-input-background, #3c3c3c)',
            color: 'var(--vscode-input-foreground, #ccc)',
            border: '1px solid var(--border)',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '11px'
          }}
        />
        <div style={{ display: 'flex', gap: '4px' }}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--vscode-dropdown-background, #3c3c3c)',
              color: 'var(--vscode-dropdown-foreground, #ccc)',
              border: '1px solid var(--border)',
              padding: '4px',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          >
            <option value="">All Types</option>
            <option value="Architecture Decision">Architecture Decision</option>
            <option value="Implementation History">Implementation History</option>
            <option value="Execution Summary">Execution Summary</option>
            <option value="Bug History">Bug History</option>
            <option value="Refactoring History">Refactoring History</option>
            <option value="Workspace Insight">Workspace Insight</option>
            <option value="Dependency Insight">Dependency Insight</option>
            <option value="Coding Preference">Coding Preference</option>
            <option value="Project Convention">Project Convention</option>
          </select>
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--vscode-dropdown-background, #3c3c3c)',
              color: 'var(--vscode-dropdown-foreground, #ccc)',
              border: '1px solid var(--border)',
              padding: '4px',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          >
            <option value="">All Tags</option>
            {allTags.map((tag: any) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
        {recentMemories.length === 0 ? (
          <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center' }}>No memories matched filters.</div>
        ) : (
          recentMemories.map(mem => (
            <div key={mem.id} style={{ borderLeft: '2px solid var(--vscode-button-background, #007acc)', paddingLeft: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong style={{ color: '#4ec9b0' }}>{mem.title}</strong>
                <button 
                  onClick={() => handleDeleteMemory(mem.id)}
                  style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '10px' }}
                >
                  Delete
                </button>
              </div>
              <div style={{ fontSize: '10px', color: '#888' }}>
                Type: {mem.type} | Importance: {mem.importance}/10
              </div>
              {mem.summary && <div style={{ fontSize: '11px', margin: '3px 0' }}>{mem.summary}</div>}
              {mem.content && <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '3px' }}>{mem.content}</pre>}
              {mem.tags && mem.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {mem.tags.map((t: string) => (
                    <span key={t} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px', fontSize: '9px' }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Memory Form */}
      <form onSubmit={handleSaveMemory} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <h5 style={{ margin: 0, fontSize: '11px', color: '#888' }}>Record New Memory / Decision</h5>
        
        {errorMsg && <div style={{ color: '#f44336', fontSize: '10px' }}>{errorMsg}</div>}

        <input 
          type="text" 
          placeholder="Memory Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            background: 'var(--vscode-input-background, #3c3c3c)',
            color: 'var(--vscode-input-foreground, #ccc)',
            border: '1px solid var(--border)',
            padding: '4px 6px',
            borderRadius: '3px',
            fontSize: '11px'
          }}
        />

        <input 
          type="text" 
          placeholder="One-line summary" 
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          style={{
            background: 'var(--vscode-input-background, #3c3c3c)',
            color: 'var(--vscode-input-foreground, #ccc)',
            border: '1px solid var(--border)',
            padding: '4px 6px',
            borderRadius: '3px',
            fontSize: '11px'
          }}
        />

        <textarea 
          placeholder="Content details..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          style={{
            background: 'var(--vscode-input-background, #3c3c3c)',
            color: 'var(--vscode-input-foreground, #ccc)',
            border: '1px solid var(--border)',
            padding: '4px 6px',
            borderRadius: '3px',
            fontSize: '11px',
            resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', gap: '4px' }}>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            style={{
              flex: 1.5,
              background: 'var(--vscode-dropdown-background, #3c3c3c)',
              color: 'var(--vscode-dropdown-foreground, #ccc)',
              border: '1px solid var(--border)',
              padding: '4px',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          >
            <option value="Architecture Decision">Architecture Decision</option>
            <option value="Workspace Insight">Workspace Insight</option>
            <option value="Coding Preference">Coding Preference</option>
            <option value="Project Convention">Project Convention</option>
          </select>
          <input 
            type="number" 
            placeholder="Importance (1-10)" 
            min="1" 
            max="10"
            value={importance}
            onChange={(e) => setImportance(parseInt(e.target.value) || 5)}
            style={{
              flex: 1,
              background: 'var(--vscode-input-background, #3c3c3c)',
              color: 'var(--vscode-input-foreground, #ccc)',
              border: '1px solid var(--border)',
              padding: '4px 6px',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          />
        </div>

        <input 
          type="text" 
          placeholder="Tags (comma separated)" 
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          style={{
            background: 'var(--vscode-input-background, #3c3c3c)',
            color: 'var(--vscode-input-foreground, #ccc)',
            border: '1px solid var(--border)',
            padding: '4px 6px',
            borderRadius: '3px',
            fontSize: '11px'
          }}
        />

        <input 
          type="text" 
          placeholder="Related files (comma separated)" 
          value={filesStr}
          onChange={(e) => setFilesStr(e.target.value)}
          style={{
            background: 'var(--vscode-input-background, #3c3c3c)',
            color: 'var(--vscode-input-foreground, #ccc)',
            border: '1px solid var(--border)',
            padding: '4px 6px',
            borderRadius: '3px',
            fontSize: '11px'
          }}
        />

        <button 
          type="submit"
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '6px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '11px'
          }}
        >
          Add Memory
        </button>
      </form>
    </div>
  );
};
