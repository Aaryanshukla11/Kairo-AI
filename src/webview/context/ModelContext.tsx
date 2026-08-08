import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { vscodeBridge } from '../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';

export interface ActiveModel {
  id: string;
  displayName: string;
  provider: string;
  runtime: string;
  local: boolean;
  status: 'loading' | 'ready' | 'busy' | 'offline';
  contextWindow: number;
  maxOutputTokens: number;
}

export interface ModelInfo {
  id: string;
  displayName: string;
  provider: string;
  runtime: string;
  local: boolean;
  contextWindow: number;
  maxOutputTokens: number;
  installed: boolean;
  description?: string;
}

export interface ModelContextType {
  activeModel: ActiveModel;
  installedModels: ModelInfo[];
  loading: boolean;
  switchModel: (modelId: string) => Promise<void>;
  refreshModels: () => void;
}

export const initialActiveModel: ActiveModel = {
  id: 'qwen2.5-coder:7b',
  displayName: 'Qwen2.5 Coder 7B',
  provider: 'Ollama',
  runtime: 'Ollama',
  local: true,
  status: 'ready',
  contextWindow: 32768,
  maxOutputTokens: 8192
};

export const ModelContext = createContext<ModelContextType>({
  activeModel: initialActiveModel,
  installedModels: [],
  loading: false,
  switchModel: async () => {},
  refreshModels: () => {}
});

interface ModelProviderProps {
  children: React.ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps): React.JSX.Element {
  const [activeModel, setActiveModel] = useState<ActiveModel>(initialActiveModel);
  const [installedModels, setInstalledModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleModelStatus = (msg: any) => {
      if (msg.type === MessageType.MODEL_STATUS || msg.type === MessageType.MODEL_SWITCH_RESPONSE) {
        const payload = msg.payload || {};
        if (payload.activeModel) {
          setActiveModel(payload.activeModel);
        }
        if (Array.isArray(payload.installedModels) && payload.installedModels.length > 0) {
          setInstalledModels(payload.installedModels);
        }
        setLoading(false);
      } else if (msg.type === MessageType.MODEL_LIST) {
        const payload = msg.payload || {};
        if (Array.isArray(payload.installedModels)) {
          setInstalledModels(payload.installedModels);
        }
        setLoading(false);
      } else if (msg.type === MessageType.MODEL_READY) {
        setActiveModel(prev => ({ ...prev, status: 'ready' }));
      } else if (msg.type === MessageType.MODEL_LOADING) {
        setActiveModel(prev => ({ ...prev, status: 'loading' }));
      } else if (msg.type === MessageType.MODEL_OFFLINE) {
        setActiveModel(prev => ({ ...prev, status: 'offline', displayName: 'No Runtime Connected' }));
      }
    };

    vscodeBridge.subscribe(MessageType.MODEL_STATUS, handleModelStatus);
    vscodeBridge.subscribe(MessageType.MODEL_LIST, handleModelStatus);
    vscodeBridge.subscribe(MessageType.MODEL_SWITCH_RESPONSE, handleModelStatus);
    vscodeBridge.subscribe(MessageType.MODEL_READY, handleModelStatus);
    vscodeBridge.subscribe(MessageType.MODEL_LOADING, handleModelStatus);
    vscodeBridge.subscribe(MessageType.MODEL_OFFLINE, handleModelStatus);

    // Initial query on mount
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MODEL_STATUS as any,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.MODEL_STATUS, handleModelStatus);
      vscodeBridge.unsubscribe(MessageType.MODEL_LIST, handleModelStatus);
      vscodeBridge.unsubscribe(MessageType.MODEL_SWITCH_RESPONSE, handleModelStatus);
      vscodeBridge.unsubscribe(MessageType.MODEL_READY, handleModelStatus);
      vscodeBridge.unsubscribe(MessageType.MODEL_LOADING, handleModelStatus);
      vscodeBridge.unsubscribe(MessageType.MODEL_OFFLINE, handleModelStatus);
    };
  }, []);

  const switchModel = useCallback(async (modelId: string) => {
    setLoading(true);
    // Optimistic status update
    setActiveModel(prev => ({ ...prev, status: 'loading' }));

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MODEL_SWITCH_REQUEST as any,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { modelId }
    });
  }, []);

  const refreshModels = useCallback(() => {
    setLoading(true);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MODEL_STATUS as any,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION
    });
  }, []);

  return (
    <ModelContext.Provider
      value={{
        activeModel,
        installedModels,
        loading,
        switchModel,
        refreshModels
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModelContext(): ModelContextType {
  return useContext(ModelContext);
}
