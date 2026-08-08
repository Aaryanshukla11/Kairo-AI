import { IValidationProvider, ValidationContext, ValidationResult } from '../validationTypes';
import { architectureAuditor } from '../architectureAuditor';

export class ArchitectureProvider implements IValidationProvider {
  public readonly id = 'architecture-provider';
  public readonly name = 'Architecture Provider';
  public readonly targetSubsystem = 'Architecture';

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    return architectureAuditor.validate(context);
  }
}

export const architectureProvider = new ArchitectureProvider();
export default architectureProvider;
