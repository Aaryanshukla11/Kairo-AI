import { IValidationProvider, ValidationContext, ValidationResult } from '../validationTypes';
import { integrationValidator } from '../integrationValidator';

export class IntegrationProvider implements IValidationProvider {
  public readonly id = 'integration-provider';
  public readonly name = 'Integration Provider';
  public readonly targetSubsystem = 'Integration';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    return integrationValidator.validate(context);
  }
}

export const integrationProvider = new IntegrationProvider();
export default integrationProvider;
