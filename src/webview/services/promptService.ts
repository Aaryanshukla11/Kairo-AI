import { PromptFactory } from '../../common/prompt';
import { vscodeBridge } from './vscodeBridge';
import { messageBus } from './messageBus';
import { MessageType, MessageSource, MessageTarget } from '../../common/protocol';
import { PromptResult } from '../../common/prompt';

export class PromptService {
  /**
   * Submits a raw prompt string from the UI layer to the VS Code extension host.
   * Resolves when the extension backend returns a mock PromptResult response.
   */
  public async submitPrompt(rawText: string): Promise<PromptResult> {
    const prompt = PromptFactory.createPrompt(
      rawText,
      MessageSource.WEBVIEW,
      undefined,
      undefined,
      {}
    );

    return new Promise((resolve) => {
      // 1. Subscribe to the future PROMPT_RESPONSE payload matching this ID
      const handler = (msg: any) => {
        if (msg.payload && msg.payload.promptId === prompt.id) {
          messageBus.unsubscribe(MessageType.PROMPT_RESPONSE, handler);
          resolve(msg.payload as PromptResult);
        }
      };

      messageBus.subscribe(MessageType.PROMPT_RESPONSE, handler);

      // 2. Dispatch the prompt request IPC boundary
      vscodeBridge.postMessage({
        id: prompt.id,
        type: MessageType.PROMPT_REQUEST,
        timestamp: Date.now(),
        source: MessageSource.WEBVIEW,
        target: MessageTarget.EXTENSION,
        payload: prompt,
        version: "1.0.0" as any, // Typed mapped generically in BridgeMessage
      });
    });
  }

  public sendPromptMessage(content: string, id: string): void {
    vscodeBridge.postMessage({
      id,
      type: MessageType.SEND_PROMPT,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { id, content },
      version: "1.0.0" as any,
    });
  }

  public async requestPlan(prompt: string): Promise<any> {
    const id = Date.now().toString();
    return new Promise((resolve, reject) => {
      const successHandler = (msg: any) => {
        messageBus.unsubscribe(MessageType.PLAN_RESPONSE, successHandler);
        messageBus.unsubscribe(MessageType.ERROR, errorHandler);
        resolve(msg.payload?.plan);
      };

      const errorHandler = (msg: any) => {
        messageBus.unsubscribe(MessageType.PLAN_RESPONSE, successHandler);
        messageBus.unsubscribe(MessageType.ERROR, errorHandler);
        reject(new Error(msg.payload?.error || 'Failed to generate plan'));
      };

      messageBus.subscribe(MessageType.PLAN_RESPONSE, successHandler);
      messageBus.subscribe(MessageType.ERROR, errorHandler);

      vscodeBridge.postMessage({
        id,
        type: MessageType.PLAN_REQUEST,
        timestamp: Date.now(),
        source: MessageSource.WEBVIEW,
        target: MessageTarget.EXTENSION,
        payload: { prompt },
        version: "1.0.0" as any,
      });
    });
  }
}

export const promptService = new PromptService();
