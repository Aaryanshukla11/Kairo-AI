import { randomUUID } from 'crypto';

process.noDeprecation = true;

export interface IOllamaHealthStatus {
  isInstalled: boolean;
  isRunning: boolean;
  isApiReachable: boolean;
  version?: string;
  installedModels: string[];
  diagnostics?: string;
}

export interface IOllamaGenerationOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_predict?: number;
  stream?: boolean;
}

export interface IInstallationInstructions {
  missingModels: string[];
  instructions: string[];
  rawCommands: string[];
}

export class OllamaRuntime {
  private serverUrl = 'http://localhost:11434';
  private activeController: AbortController | null = null;
  private isInitialConnectionSuccessful = false;

  constructor(customUrl?: string) {
    if (customUrl) {
      this.serverUrl = customUrl;
    }
    console.log('[OllamaRuntime] Runtime Started');
  }

  /**
   * Connection Management: checks if Ollama server is running
   */
  public async isServerRunning(): Promise<boolean> {
    try {
      const res = await fetch(`${this.serverUrl}/api/tags`);
      return res.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Health Checks: performs comprehensive connection and model verification
   */
  public async health(): Promise<IOllamaHealthStatus> {
    const isInstalled = this.checkOllamaInstalled();
    let isRunning = false;
    let isApiReachable = false;
    let version: string | undefined = undefined;
    let installedModels: string[] = [];
    let diagnostics = '';

    try {
      const versionRes = await fetch(`${this.serverUrl}/api/version`);
      if (versionRes.ok) {
        const data = await versionRes.json() as { version?: string };
        version = data.version;
      }
    } catch {}

    try {
      const tagsRes = await fetch(`${this.serverUrl}/api/tags`);
      if (tagsRes.status === 200) {
        isRunning = true;
        isApiReachable = true;
        const data = await tagsRes.json() as { models?: Array<{ name: string }> };
        installedModels = (data.models || []).map(m => m.name);
      }
    } catch (err: any) {
      diagnostics = `API request failed: ${err.message || String(err)}`;
    }

    if (!isRunning) {
      if (!isInstalled) {
        diagnostics = 'Ollama is not installed. Please download and install Ollama from https://ollama.com/';
      } else {
        diagnostics = 'Ollama is installed but not running. Please start the Ollama application or run `ollama serve`.';
      }
    }

    return {
      isInstalled,
      isRunning,
      isApiReachable,
      version,
      installedModels,
      diagnostics: diagnostics || undefined
    };
  }

  private checkOllamaInstalled(): boolean {
    try {
      require('child_process').execSync('ollama --version', { stdio: 'ignore' });
      return true;
    } catch {}

    try {
      const fs = require('fs');
      const path = require('path');
      const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
      const possiblePaths = [
        path.join(localAppData, 'Programs', 'Ollama', 'ollama.exe'),
        'C:\\Program Files\\Ollama\\ollama.exe',
        'C:\\Program Files (x86)\\Ollama\\ollama.exe'
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) return true;
      }
    } catch {}

    return false;
  }

  /**
   * Model Availability Detection: list all installed local models
   */
  public async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.serverUrl}/api/tags`);
      if (!res.ok) return [];
      const data = await res.json() as { models?: Array<{ name: string }> };
      return (data.models || []).map(m => m.name);
    } catch {
      return [];
    }
  }

  /**
   * Model Loading status check
   */
  public async loadModel(modelName: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some(m => m === modelName || m.startsWith(modelName + ':'));
  }

  /**
   * Model Manager structured installation instructions if V1 models are missing
   */
  public getInstallationInstructions(missingModels: string[]): IInstallationInstructions {
    return {
      missingModels,
      instructions: [
        '1. Ensure the Ollama background service is running on your machine.',
        ...missingModels.map(m => `2. Run the pull command: 'ollama pull ${m}' in your command prompt or terminal.`)
      ],
      rawCommands: missingModels.map(m => `ollama pull ${m}`)
    };
  }

  /**
   * Text Generation API (non-streaming)
   */
  public async generate(prompt: string, options: IOllamaGenerationOptions = {}): Promise<string> {
    const startTime = Date.now();
    const model = options.model || 'qwen2.5-coder:7b';
    console.log(`[OllamaRuntime] Model Selected: ${model}`);
    console.log('[OllamaRuntime] Inference Started');

    if (this.activeController) {
      this.activeController.abort();
    }
    this.activeController = new AbortController();
    const signal = this.activeController.signal;

    try {
      const response = await fetch(`${this.serverUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          options: {
            temperature: options.temperature,
            top_p: options.top_p,
            top_k: options.top_k,
            num_predict: options.num_predict
          },
          stream: false
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Ollama generation request failed with status code ${response.status}`);
      }

      const data = await response.json() as { response?: string; eval_count?: number };
      const duration = Date.now() - startTime;
      console.log(`[OllamaRuntime] Inference Finished. Latency: ${duration}ms. Tokens: ${data.eval_count || 0}`);

      if (!this.isInitialConnectionSuccessful) {
        this.isInitialConnectionSuccessful = true;
        console.log('[OllamaRuntime] Connection Successful');
      }

      return data.response || '';
    } catch (err: any) {
      console.error(`[OllamaRuntime] Error: ${err.message || String(err)}`);
      throw err;
    }
  }

  /**
   * Streaming Text Generation Support API
   */
  public async streamGenerate(
    prompt: string,
    onToken: (token: string) => void,
    options: IOllamaGenerationOptions = {}
  ): Promise<string> {
    const startTime = Date.now();
    const model = options.model || 'qwen2.5-coder:7b';
    console.log(`[OllamaRuntime] Model Selected: ${model}`);
    console.log('[OllamaRuntime] Inference Started');

    if (this.activeController) {
      this.activeController.abort();
    }
    this.activeController = new AbortController();
    const signal = this.activeController.signal;

    try {
      const response = await fetch(`${this.serverUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          options: {
            temperature: options.temperature,
            top_p: options.top_p,
            top_k: options.top_k,
            num_predict: options.num_predict
          },
          stream: true
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Ollama generation request failed with status code ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body stream reader not available.');
      }

      let generatedText = '';
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        if (signal.aborted) {
          throw new Error('Inference execution was cancelled.');
        }

        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkStr = decoder.decode(value, { stream: !done });
          const lines = chunkStr.split('\n').filter(l => l.trim() !== '');

          for (const line of lines) {
            try {
              const parsedLine = JSON.parse(line);
              if (parsedLine.response) {
                generatedText += parsedLine.response;
                onToken(parsedLine.response);
              }
            } catch {
              // Ignore partial lines during stream decoding
            }
          }
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[OllamaRuntime] Inference Finished. Latency: ${duration}ms.`);

      if (!this.isInitialConnectionSuccessful) {
        this.isInitialConnectionSuccessful = true;
        console.log('[OllamaRuntime] Connection Successful');
      }

      return generatedText;
    } catch (err: any) {
      console.error(`[OllamaRuntime] Error: ${err.message || String(err)}`);
      throw err;
    }
  }

  /**
   * Cancel ongoing generation stream
   */
  public cancelGeneration(): void {
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
      console.log('[OllamaRuntime] Inference Cancelled');
    }
  }

  /**
   * Single Embedding Generation API (Offline support via nomic-embed-text)
   */
  public async embed(content: string, model = 'nomic-embed-text'): Promise<number[]> {
    try {
      const response = await fetch(`${this.serverUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: content
        })
      });

      if (response.ok) {
        const data = await response.json() as { embedding?: number[]; embeddings?: number[][] };
        if (data.embedding) return data.embedding;
        if (data.embeddings && data.embeddings[0]) return data.embeddings[0];
      }

      // Fallback API try for older / newer Ollama API schemas
      const responseEmbed = await fetch(`${this.serverUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          input: content
        })
      });

      if (!responseEmbed.ok) {
        throw new Error(`Embedding request failed with status code ${responseEmbed.status}`);
      }

      const dataEmbed = await responseEmbed.json() as { embedding?: number[]; embeddings?: number[][] };
      if (dataEmbed.embedding) return dataEmbed.embedding;
      if (dataEmbed.embeddings && dataEmbed.embeddings[0]) return dataEmbed.embeddings[0];

      throw new Error('No embedding vector returned in response.');
    } catch (err: any) {
      console.error(`[OllamaRuntime] Embedding Error: ${err.message || String(err)}`);
      throw err;
    }
  }

  /**
   * Batch Embedding Generation API
   */
  public async batchEmbed(contents: string[], model = 'nomic-embed-text'): Promise<number[][]> {
    return Promise.all(contents.map(text => this.embed(text, model)));
  }
}

export const ollamaRuntime = new OllamaRuntime();
export default ollamaRuntime;
