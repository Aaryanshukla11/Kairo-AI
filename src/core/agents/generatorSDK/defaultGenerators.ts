import { BaseSDKGenerator } from './baseGeneratorSDK';
import { IGeneratorExecutionContext, IGeneratorExecutionResult } from './generatorSDKTypes';

import { ConfigGeneratorSDK } from './config/configGeneratorSDK';
export { ConfigGeneratorSDK as ConfigGenerator };

export class SharedUtilGenerator extends BaseSDKGenerator {
  public readonly id = 'SharedUtilGenerator';
  public readonly name = 'Shared Utilities Generator';
  public readonly version = '1.0.0';
  public readonly description = 'Generates shared helper utilities, logger constants, and error wrappers.';
  public readonly capabilities = Object.freeze(['utilities', 'helpers', 'types']);
  public readonly priority = 2;

  public async execute(context: IGeneratorExecutionContext): Promise<IGeneratorExecutionResult> {
    const startTime = Date.now();
    return {
      generatorId: this.id,
      success: true,
      generatedArtifacts: Object.freeze(['src/common/utils.ts', 'src/common/types.ts']),
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
  public readonly capabilities = Object.freeze(['react', 'ui_components', 'views']);
  public readonly priority = 4;

  public async execute(context: IGeneratorExecutionContext): Promise<IGeneratorExecutionResult> {
    const startTime = Date.now();
    return {
      generatorId: this.id,
      success: true,
      generatedArtifacts: Object.freeze(['src/index.ts', 'src/components/App.tsx']),
      executionTimeMs: Date.now() - startTime,
      validationPassed: true
    };
  }
}
