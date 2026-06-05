import { RouterTaskType } from './routingTypes';
import { ModelCapability } from '../modelRegistry/registryTypes';

export class RouterPolicy {
  public getRequiredCapabilities(task: RouterTaskType): ModelCapability[] {
    switch (task) {
      case RouterTaskType.Planning:
        return [ModelCapability.Planning, ModelCapability.Reasoning];
      case RouterTaskType.CodeGeneration:
      case RouterTaskType.CodeCompletion:
        return [ModelCapability.CodeGeneration, ModelCapability.CodeCompletion];
      case RouterTaskType.Review:
      case RouterTaskType.Debugging:
        return [ModelCapability.CodeReview, ModelCapability.ToolCalling];
      case RouterTaskType.Chat:
      default:
        return [ModelCapability.Chat];
    }
  }
}

export const routerPolicy = new RouterPolicy();
