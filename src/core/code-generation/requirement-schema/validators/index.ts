import { 
  ITechnicalStack, 
  IProjectIdentity, 
  IRiskIndicator 
} from '../contracts';
import { ConflictError, DependencyValidationError, RiskValidationError } from '../errors';

export class SchemaValidatorsPipeline {
  public runValidation(
    identity: IProjectIdentity,
    stack: ITechnicalStack
  ): {
    errors: string[];
    warnings: string[];
    risks: IRiskIndicator[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const risks: IRiskIndicator[] = [];

    // 1. Structural checks
    if (!identity.projectName || !identity.projectType) {
      errors.push('Structural Validation Error: projectName and projectType are mandatory attributes.');
    }

    // 2. Conflict detection (Conflicting technology stacks combinations)
    const conflicts = [
      { f1: 'React Native', f2: 'Spring Boot', platform: 'desktop', error: 'Unsupported framework combination: React Native + Spring Boot is incompatible for native Desktop builds.' },
      { f1: 'Flutter', f2: 'Next.js', platform: 'web', error: 'Unsupported framework combination: Flutter + Next.js is incompatible for standard Web builds.' },
      { f1: 'SQLite', f2: 'Docker', platform: 'gcp', error: 'Experimental warning: Deploying SQLite container to distributed GCP cluster setup is highly discouraged.' }
    ];

    for (const c of conflicts) {
      if (
        (stack.frontend === c.f1 || stack.database === c.f1) &&
        (stack.backend === c.f2 || stack.frontend === c.f2) &&
        (identity.targetPlatform === c.platform || stack.deployment === c.platform)
      ) {
        errors.push(c.error);
        throw new ConflictError(
          c.error,
          'Ensure stack frameworks and target platforms align correctly.'
        );
      }
    }

    // 3. Dependency validation check
    // PostgreSQL -> Postgres Database generator validation required
    if (stack.database === 'PostgreSQL' && !stack.backend) {
      const msg = 'Dependency validation failure: PostgreSQL database requires a Backend stack configuration to map routes.';
      errors.push(msg);
      throw new DependencyValidationError(msg, 'Select Express or FastAPI backend stack.');
    }

    // Docker -> Deployment files mandatory
    if (stack.deployment === 'Docker' && !identity.targetPlatform) {
      const msg = 'Dependency validation failure: Docker deployment target requires a target platform setting.';
      errors.push(msg);
      throw new DependencyValidationError(msg, 'Specify target platform, e.g. web or api.');
    }

    // 4. Risk Analysis
    if (stack.backend === 'Spring Boot' && stack.frontend === 'Svelte') {
      risks.push({
        field: 'stack.frontend',
        severity: 'MEDIUM',
        message: 'Experimental stack detected: Svelte frontend paired with Spring Boot backend has fewer community resources.',
        recoverySuggestion: 'Consider standard React + Spring Boot or Svelte + Express combinations.'
      });
      throw new RiskValidationError(
        'Experimental stack combinations detected.',
        'Review risk indicators warnings recommendations.'
      );
    }

    return {
      errors,
      warnings,
      risks
    };
  }
}

export const schemaValidatorsPipeline = new SchemaValidatorsPipeline();
export default schemaValidatorsPipeline;
