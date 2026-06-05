import { BaseSDKGenerator } from './baseGeneratorSDK';
import { IGeneratorExecutionContext, IGeneratorExecutionResult } from './generatorSDKTypes';

import { ConfigGeneratorSDK } from './config/configGeneratorSDK';
export { ConfigGeneratorSDK as ConfigGenerator };

function extractTargetFilesForGenerator(context: IGeneratorExecutionContext, generatorId: string, capabilities: readonly string[]): string[] {
  const targetFiles: string[] = [];

  const tasks = context.generationPlan?.orderedTaskList || [];
  for (const t of tasks) {
    const reqCap = (t as any).requiredCapability || (t as any).capability;
    if (
      t.generatorId === generatorId ||
      (reqCap && capabilities.includes(reqCap)) ||
      (t.generatorId && capabilities.includes(t.generatorId))
    ) {
      if (Array.isArray(t.targetFiles)) {
        targetFiles.push(...t.targetFiles);
      }
    }
  }

  if (Array.isArray(context.customPayload?.targetFiles)) {
    targetFiles.push(...context.customPayload.targetFiles);
  }
  if (Array.isArray(context.customPayload?.task?.targetFiles)) {
    targetFiles.push(...context.customPayload.task.targetFiles);
  }

  return Array.from(new Set(targetFiles));
}

export class SharedUtilGenerator extends BaseSDKGenerator {
  public readonly id = 'SharedUtilGenerator';
  public readonly name = 'Shared Utilities Generator';
  public readonly version = '1.0.0';
  public readonly description = 'Generates shared helper utilities, logger constants, and error wrappers.';
  public readonly capabilities = Object.freeze(['utilities', 'helpers', 'types', 'javascript', 'typescript']);
  public readonly priority = 2;

  public async execute(context: IGeneratorExecutionContext): Promise<IGeneratorExecutionResult> {
    const startTime = Date.now();
    const artifacts = extractTargetFilesForGenerator(context, this.id, this.capabilities);
    return {
      generatorId: this.id,
      success: true,
      generatedArtifacts: Object.freeze(artifacts),
      executionTimeMs: Date.now() - startTime,
      validationPassed: true
    };
  }
}

import { BackendGeneratorSDK } from './backend/backendGeneratorSDK';
export { BackendGeneratorSDK as BackendGenerator };

export class UIComponentGenerator extends BaseSDKGenerator {
  public readonly id = 'UIComponentGenerator';
  public readonly name = 'UI Presentation Generator';
  public readonly version = '1.0.0';
  public readonly description = 'Generates frontend UI views, page routes, and component layouts.';
  public readonly capabilities = Object.freeze(['react', 'ui_components', 'views', 'html', 'css', 'frontend']);
  public readonly priority = 4;

  public async execute(context: IGeneratorExecutionContext): Promise<IGeneratorExecutionResult> {
    const startTime = Date.now();
    const artifacts = extractTargetFilesForGenerator(context, this.id, this.capabilities);
    return {
      generatorId: this.id,
      success: true,
      generatedArtifacts: Object.freeze(artifacts),
      executionTimeMs: Date.now() - startTime,
      validationPassed: true
    };
  }
}
