import React, { useState } from 'react';
import { ComposerTextarea } from './ComposerTextarea';
import { ComposerToolbar } from './ComposerToolbar';
import { SendButton } from './SendButton';
import { useAppContext } from '../../context/AppContext';
import { promptService } from '../../services/promptService';

export function PromptComposer(): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const { chatState, setChatState } = useAppContext();

  const handleSend = () => {
    if (!inputValue.trim() || chatState.isTyping) return;

    const messageId = Date.now().toString(); // simple ID for MVP
    
    // Append user message immediately
    setChatState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: messageId,
          role: 'USER',
          timestamp: Date.now(),
          content: inputValue,
          status: 'SUCCESS'
        }
      ],
      isTyping: true
    }));

    // Send through IPC
    promptService.requestPlan(inputValue)
      .then((payload) => {
        setChatState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `plan-${Date.now()}`,
              role: 'PLAN_PROPOSAL',
              timestamp: Date.now(),
              content: '',
              status: 'SUCCESS',
              plan: payload?.plan,
              approval: payload?.approval
            }
          ],
          isTyping: false
        }));
      })
      .catch((error) => {
        setChatState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `error-${Date.now()}`,
              role: 'ERROR',
              timestamp: Date.now(),
              content: error.message,
              status: 'ERROR'
            }
          ],
          isTyping: false
        }));
      });

    // Clear input
    setInputValue('');
  };

  return (
    <div className="composer-panel">
      <ComposerToolbar />
      <div className="composer-wrapper">
        <ComposerTextarea 
          value={inputValue} 
          onChange={setInputValue} 
          onSend={handleSend}
          disabled={chatState.isTyping}
        />
        <SendButton 
          onSend={handleSend} 
          disabled={!inputValue.trim() || chatState.isTyping} 
        />
      </div>
    </div>
  );
}
