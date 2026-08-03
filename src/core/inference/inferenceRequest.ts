import { InferenceRequestModel } from './inferenceTypes';

export class InferenceRequest {
  public static fromJson(json: any): InferenceRequestModel {
    return {
      requestId: json.requestId || `req-${Date.now()}`,
      sessionId: json.sessionId || `sess-${Date.now()}`,
      modelId: json.modelId || 'qwen-2.5-7b-coder',
      prompt: json.prompt || '',
      systemPrompt: json.systemPrompt || '',
      workspaceContext: json.workspaceContext || '',
      temperature: json.temperature ?? 0.7,
      topP: json.topP ?? 0.9,
      topK: json.topK ?? 40,
      seed: json.seed ?? 42,
      maxTokens: json.maxTokens ?? 2048,
      stopTokens: json.stopTokens || [],
      streaming: json.streaming ?? true
    };
  }
}
