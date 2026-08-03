import { ModelInfo, ModelCapability, CapabilityReport } from './registryTypes';

export class ModelCapabilitiesDetector {
  public detectCapabilities(model: ModelInfo): CapabilityReport {
    const supported: ModelCapability[] = [];
    const unsupported: ModelCapability[] = [];

    // Basic heuristic capability detection based on architecture and metadata
    const name = model.displayName.toLowerCase();
    const id = model.modelId.toLowerCase();

    // Chat capability
    if (name.includes('instruct') || name.includes('chat') || name.includes('coder') || name.includes('agent')) {
      supported.push(ModelCapability.Chat);
    } else {
      unsupported.push(ModelCapability.Chat);
    }

    // Code capabilities
    if (name.includes('coder') || name.includes('code') || id.includes('code')) {
      supported.push(ModelCapability.CodeGeneration);
      supported.push(ModelCapability.CodeReview);
      supported.push(ModelCapability.CodeCompletion);
    } else {
      unsupported.push(ModelCapability.CodeGeneration);
      unsupported.push(ModelCapability.CodeReview);
      unsupported.push(ModelCapability.CodeCompletion);
    }

    // Tool/Function calling capabilities
    if (name.includes('instruct') || name.includes('coder') || name.includes('agent') || id.includes('qwen')) {
      supported.push(ModelCapability.FunctionCalling);
      supported.push(ModelCapability.ToolCalling);
    } else {
      unsupported.push(ModelCapability.FunctionCalling);
      unsupported.push(ModelCapability.ToolCalling);
    }

    // Context Length capability
    if (model.contextLength >= 16384) {
      supported.push(ModelCapability.LongContext);
    } else {
      unsupported.push(ModelCapability.LongContext);
    }

    // Reasoning capability
    if (name.includes('instruct') || name.includes('reasoning') || name.includes('math') || name.includes('deepseek')) {
      supported.push(ModelCapability.Reasoning);
      supported.push(ModelCapability.Planning);
    } else {
      unsupported.push(ModelCapability.Reasoning);
      unsupported.push(ModelCapability.Planning);
    }

    // RAG and Embeddings
    if (name.includes('embed') || id.includes('embed')) {
      supported.push(ModelCapability.Embedding);
      supported.push(ModelCapability.RAG);
    } else if (supported.includes(ModelCapability.Chat)) {
      supported.push(ModelCapability.RAG); // Chat models can do RAG
      unsupported.push(ModelCapability.Embedding);
    } else {
      unsupported.push(ModelCapability.Embedding);
      unsupported.push(ModelCapability.RAG);
    }

    // Vision capability
    if (name.includes('vision') || name.includes('vl') || id.includes('vision')) {
      supported.push(ModelCapability.Vision);
    } else {
      unsupported.push(ModelCapability.Vision);
    }

    // Calculate confidence score based on metadata richness
    let confidence = 0.5;
    if (model.parameters && model.architecture) confidence += 0.2;
    if (model.quantization) confidence += 0.2;
    if (model.languages && model.languages.length > 0) confidence += 0.1;

    return {
      modelId: model.modelId,
      supported,
      unsupported,
      confidenceScore: Math.min(confidence, 1.0)
    };
  }
}

export const modelCapabilitiesDetector = new ModelCapabilitiesDetector();
