import { IValidationProvider, ValidationContext, ValidationResult } from '../validationTypes';
import { dependencyAuditor } from '../dependencyAuditor';

export class ValidationProvider implements IValidationProvider {
  public readonly id = 'validation-provider';
  public readonly name = 'Validation Provider';
  public readonly targetSubsystem = 'Dependency Graph';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    return dependencyAuditor.validate(context);
  }
}

export const validationProvider = new ValidationProvider();
export default validationProvider;
