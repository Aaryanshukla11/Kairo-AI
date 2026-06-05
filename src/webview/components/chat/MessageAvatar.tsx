import React from 'react';

interface MessageAvatarProps {
  role: 'user' | 'assistant' | 'system';
}

export function MessageAvatar({ role }: MessageAvatarProps): React.JSX.Element | null {
  if (role === 'system') return null;
  
  return (
    <div className={`message-avatar avatar-${role}`}>
      {role === 'assistant' ? (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><path d="M12 8v14"></path><path d="M16 12h4"></path><path d="M4 12h4"></path></svg>
      ) : (
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      )}
    </div>
  );
}
