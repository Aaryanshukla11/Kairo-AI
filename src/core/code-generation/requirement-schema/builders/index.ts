import { 
  IEnterpriseRequirement, 
  IProjectIdentity, 
  IBusinessInfo, 
  ITechnicalStack, 
  IQualityAttributes, 
  IExtensionFields 
} from '../contracts';
import { schemaVersioning } from '../versioning';
import { canonicalNormalizer } from '../normalizer';
import { schemaValidatorsPipeline } from '../validators';
import { validationReporter } from '../reports';

export class EnterpriseRequirementBuilder {
  public build(
    identity: IProjectIdentity,
    business: IBusinessInfo,
    stack: ITechnicalStack,
    quality: IQualityAttributes,
    extensions: IExtensionFields,
    originalPrompt: string,
    normalizedPrompt: string
  ): IEnterpriseRequirement {
    const startTime = Date.now();

    // 1. Normalize tech stack naming conventions
    const normalizedStack = canonicalNormalizer.normalizeStack(stack);

    // 2. Run validations pipeline stages
    let errors: string[] = [];
    let warnings: string[] = [];
    let risks: any[] = [];
    let isValid = true;

    try {
      const res = schemaValidatorsPipeline.runValidation(identity, normalizedStack);
      errors = res.errors;
      warnings = res.warnings;
      risks = res.risks;
      isValid = errors.length === 0;
    } catch (err: any) {
      isValid = false;
      errors.push(err.message || err);
      if (err.severity === 'WARNING') {
        warnings.push(err.message);
      }
    }

    const durationMs = Date.now() - startTime;

    // 3. Compile validation details report
    const validation = validationReporter.createReport(
      isValid,
      errors,
      warnings,
      risks,
      durationMs
    );

    // 4. Populate schema version header
    const versionInfo = schemaVersioning.createVersionInfo();

    // 5. Freeze and return the immutable contract
    const req: IEnterpriseRequirement = {
      versionInfo: Object.freeze(versionInfo),
      identity: Object.freeze({ ...identity }),
      business: Object.freeze({ ...business }),
      stack: Object.freeze(normalizedStack),
      quality: Object.freeze({ ...quality }),
      extensions: Object.freeze({ ...extensions }),
      validation: Object.freeze(validation),
      originalPrompt,
      normalizedPrompt
    };

    return Object.freeze(req);
  }
}

export const enterpriseRequirementBuilder = new EnterpriseRequirementBuilder();
export default enterpriseRequirementBuilder;
