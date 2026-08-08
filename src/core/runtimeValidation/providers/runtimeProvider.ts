import { IRuntimeValidationProvider, RuntimeValidationContext, RuntimeValidationResult } from '../runtimeTypes';
import { runtimeValidator } from '../runtimeValidator';

export class RuntimeProvider implements IRuntimeValidationProvider {
  public readonly id = 'runtime-provider-wrap';
  public readonly name = 'Runtime Provider';
  public readonly targetSubsystem = 'Runtime';

  public async validate(context: RuntimeValidationContext): Promise<RuntimeValidationResult> {
    return runtimeValidator.validate(context);
  }
}

export const runtimeProvider = new RuntimeProvider();
export default runtimeProvider;
