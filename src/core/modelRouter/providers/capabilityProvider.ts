import { ModelCapability } from '../../modelRegistry/registryTypes';

export class CapabilityProvider {
  public getCapabilities(modelId: string): ModelCapability[] {
    const id = modelId.toLowerCase();
    if (id.includes('coder')) {
      return [ModelCapability.CodeGeneration, ModelCapability.CodeCompletion, ModelCapability.ToolCalling];
    } else if (id.includes('reason')) {
      return [ModelCapability.Reasoning, ModelCapability.Planning];
    }
    return [ModelCapability.Chat];
  }
}
