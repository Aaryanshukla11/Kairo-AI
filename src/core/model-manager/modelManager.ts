import { ActiveModel, ModelInfo, ModelManagerStatusPayload } from './types';
import { ollamaProvider } from '../inference/providers/ollamaProvider';
import { ollamaRuntime } from '../inference/providers/ollamaRuntime';

export class ModelManager {
  private activeModel: ActiveModel;
  private subscribers: Set<(payload: ModelManagerStatusPayload) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.activeModel = {
      id: 'gpt-4o',
      displayName: 'OpenAI GPT-4o',
      provider: 'OpenAI',
      runtime: 'OpenAI',
      local: false,
      status: 'ready',
      contextWindow: 128000,
      maxOutputTokens: 16384
    };

    // Auto-detect runtime status on startup
    this.detectRuntimeModel().catch(() => {});
  }

  /**
   * Helper to format raw model IDs into human readable display names
   */
  private formatDisplayName(modelId: string): string {
    if (!modelId) return 'Unknown Model';
    let clean = modelId.split(':')[0]; // remove tag like :latest or :14b if present
    clean = clean
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    
    if (modelId.includes('gpt-4o-mini')) {
      return 'OpenAI GPT-4o Mini';
    }
    if (modelId.includes('gpt-4o')) {
      return 'OpenAI GPT-4o';
    }
    if (modelId.includes('gpt-4')) {
      return 'OpenAI GPT-4 Turbo';
    }
    if (modelId.includes('qwen')) {
      return clean.replace('Qwen', 'Qwen2.5 Coder');
    }
    if (modelId.includes('deepseek')) {
      return clean.includes('Coder') ? clean : `${clean} Coder`;
    }
    if (modelId.includes('codellama')) {
      return 'CodeLlama';
    }
    if (modelId.includes('llama')) {
      return clean.replace('Llama', 'Llama 3');
    }
    return clean;
  }

  /**
   * Detect real runtime model status from underlying engine (Ollama / Local runtime)
   */
  public async detectRuntimeModel(): Promise<ActiveModel> {
    try {
      const activeProvider = (process.env.KAIRO_MODEL_PROVIDER || 'openai').trim().toLowerCase();
      if (activeProvider === 'openai') {
        const openaiModelId = process.env.OPENAI_MODEL || 'gpt-4o';
        this.activeModel = {
          id: openaiModelId,
          displayName: this.formatDisplayName(openaiModelId),
          provider: 'OpenAI',
          runtime: 'OpenAI',
          local: false,
          status: process.env.OPENAI_API_KEY ? 'ready' : 'offline',
          contextWindow: 128000,
          maxOutputTokens: 16384
        };
        this.isInitialized = true;
        this.notifySubscribers();
        return this.activeModel;
      }

      const isOllamaRunning = await ollamaProvider.isServerRunning();
      if (isOllamaRunning) {
        const available = await ollamaProvider.getAvailableModels();
        if (available.length > 0) {
          // If active model is in available list, keep it; otherwise set top available model
          const matched = available.find(m => m === this.activeModel.id || m.includes(this.activeModel.id));
          const targetId = matched || available[0];
          
          this.activeModel = {
            id: targetId,
            displayName: this.formatDisplayName(targetId),
            provider: 'Ollama',
            runtime: 'Ollama',
            local: true,
            status: 'ready',
            contextWindow: 32768,
            maxOutputTokens: 8192
          };
        } else {
          this.activeModel = {
            ...this.activeModel,
            status: 'ready',
            provider: 'Ollama',
            runtime: 'Ollama',
            local: true
          };
        }
      } else {
        // Default to local ready model or offline depending on fallback
        this.activeModel = {
          ...this.activeModel,
          status: 'ready',
          provider: 'Ollama',
          runtime: 'Ollama',
          local: true
        };
      }
    } catch {
      this.activeModel = {
        ...this.activeModel,
        status: 'ready'
      };
    }

    this.isInitialized = true;
    this.notifySubscribers();
    return this.activeModel;
  }

  /**
   * Returns current active model object
   */
  public getActiveModel(): ActiveModel {
    return { ...this.activeModel };
  }

  /**
   * List all installed & available models from backend engine
   */
  public async listInstalledModels(): Promise<ModelInfo[]> {
    const installedModels: ModelInfo[] = [];

    try {
      const ollamaModels = await ollamaProvider.getAvailableModels();
      for (const rawName of ollamaModels) {
        installedModels.push({
          id: rawName,
          displayName: this.formatDisplayName(rawName),
          provider: 'Ollama',
          runtime: 'Ollama',
          local: true,
          contextWindow: 32768,
          maxOutputTokens: 8192,
          installed: true,
          description: `Ollama local model (${rawName})`
        });
      }
    } catch {
      // Fallback
    }

    // Default catalog entries if list is empty or for fallback switching
    const catalogDefaults: ModelInfo[] = [
      {
        id: 'gpt-4o',
        displayName: 'OpenAI GPT-4o',
        provider: 'OpenAI',
        runtime: 'OpenAI',
        local: false,
        contextWindow: 128000,
        maxOutputTokens: 16384,
        installed: true,
        description: 'OpenAI flagship GPT-4o cloud inference model'
      },
      {
        id: 'gpt-4o-mini',
        displayName: 'OpenAI GPT-4o Mini',
        provider: 'OpenAI',
        runtime: 'OpenAI',
        local: false,
        contextWindow: 128000,
        maxOutputTokens: 16384,
        installed: true,
        description: 'Fast, lightweight OpenAI GPT-4o Mini model'
      },
      {
        id: 'qwen2.5-coder:7b',
        displayName: 'Qwen2.5 Coder 7B',
        provider: 'Ollama',
        runtime: 'Ollama',
        local: true,
        contextWindow: 32768,
        maxOutputTokens: 8192,
        installed: true,
        description: 'Lightweight offline V1 coding model'
      },
      {
        id: 'nomic-embed-text',
        displayName: 'Nomic Embed Text',
        provider: 'Ollama',
        runtime: 'Ollama',
        local: true,
        contextWindow: 8192,
        maxOutputTokens: 512,
        installed: true,
        description: 'Lightweight offline V1 embedding model'
      }
    ];

    for (const item of catalogDefaults) {
      if (!installedModels.some(m => m.id === item.id)) {
        installedModels.push(item);
      }
    }

    return installedModels;
  }

  /**
   * Switch active coding model
   */
  public async switchModel(modelId: string): Promise<ActiveModel> {
    this.setStatus('loading');
    
    const installed = await this.listInstalledModels();
    const target = installed.find(m => m.id === modelId || m.displayName.toLowerCase() === modelId.toLowerCase());

    if (target) {
      this.activeModel = {
        id: target.id,
        displayName: target.displayName,
        provider: target.provider,
        runtime: target.runtime,
        local: target.local,
        status: 'ready',
        contextWindow: target.contextWindow,
        maxOutputTokens: target.maxOutputTokens
      };
    } else {
      this.activeModel = {
        id: modelId,
        displayName: this.formatDisplayName(modelId),
        provider: 'Ollama',
        runtime: 'Ollama',
        local: true,
        status: 'ready',
        contextWindow: 32768,
        maxOutputTokens: 8192
      };
    }

    this.notifySubscribers();
    return this.getActiveModel();
  }

  /**
   * Update active model status (e.g. 'busy' when executing inference, 'loading', 'ready', 'offline')
   */
  public setStatus(status: 'loading' | 'ready' | 'busy' | 'offline'): void {
    if (this.activeModel.status !== status) {
      this.activeModel = { ...this.activeModel, status };
      this.notifySubscribers();
    }
  }

  /**
   * Health check for runtime engine connection
   */
  public async health(): Promise<{ isOnline: boolean; status: string; diagnostics?: string; installationInstructions?: string[] }> {
    if (this.activeModel.provider === 'OpenAI') {
      const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
      return {
        isOnline: true,
        status: hasApiKey ? 'Online & Ready' : 'Ready (Awaiting OPENAI_API_KEY)',
        diagnostics: hasApiKey ? undefined : 'OPENAI_API_KEY environment variable is not set.'
      };
    }

    const status = await ollamaRuntime.health();
    const isOnline = status.isRunning;
    
    // Check if V1 models are missing
    const missing: string[] = [];
    if (status.isRunning) {
      const qwenInstalled = status.installedModels.some(m => m.includes('qwen2.5-coder:7b') || m === 'qwen2.5-coder:7b');
      const nomicInstalled = status.installedModels.some(m => m.includes('nomic-embed-text') || m === 'nomic-embed-text');
      if (!qwenInstalled) missing.push('qwen2.5-coder:7b');
      if (!nomicInstalled) missing.push('nomic-embed-text');
    }

    let diagnostics = status.diagnostics;
    let installationInstructions: string[] = [];
    if (missing.length > 0) {
      const inst = ollamaRuntime.getInstallationInstructions(missing);
      installationInstructions = inst.instructions;
      diagnostics = `Missing required models: ${missing.join(', ')}.`;
    }

    return {
      isOnline,
      status: isOnline && missing.length === 0 ? 'Online & Ready' : (isOnline ? 'Warning: Missing Models' : 'Offline'),
      diagnostics,
      installationInstructions: installationInstructions.length > 0 ? installationInstructions : undefined
    };
  }

  /**
   * Subscribe to model status updates
   */
  public subscribe(listener: (payload: ModelManagerStatusPayload) => void): () => void {
    this.subscribers.add(listener);
    // Send immediate snapshot upon subscription
    this.listInstalledModels().then(installedModels => {
      listener({
        activeModel: this.getActiveModel(),
        installedModels,
        timestamp: Date.now()
      });
    });

    return () => {
      this.subscribers.delete(listener);
    };
  }

  private async notifySubscribers(): Promise<void> {
    const installedModels = await this.listInstalledModels();
    const payload: ModelManagerStatusPayload = {
      activeModel: this.getActiveModel(),
      installedModels,
      timestamp: Date.now()
    };

    for (const listener of this.subscribers) {
      try {
        listener(payload);
      } catch (err) {
        console.error('[ModelManager] Subscriber error:', err);
      }
    }
  }
}

export const modelManager = new ModelManager();
export default modelManager;
