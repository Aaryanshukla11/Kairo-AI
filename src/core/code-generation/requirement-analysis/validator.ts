import { ExtractedFields, ValidationReport } from './types';

export class RequirementsValidator {
  public validate(fields: ExtractedFields): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflictingTech: string[] = [];

    const fe = fields.frontendPreference;
    const be = fields.backendPreference;
    const db = fields.databasePreference;
    const dp = fields.deploymentPreference;

    // 1. Conflicting technologies check
    if (fe === 'Next.js' && be === 'Django') {
      warnings.push('Hybrid Stack Warning: Deploying Next.js with Django backend requires multiple deployment zones.');
    }

    if (be === 'NestJS' && fields.programmingLanguagePreference === 'Python') {
      errors.push('Conflicting Technologies: NestJS backend is a TypeScript/JavaScript framework, which conflicts with Python preference.');
      conflictingTech.push('NestJS', 'Python');
    }

    if (dp === 'Netlify' && be && be !== 'Express') {
      warnings.push(`Vulnerability/Deployment warning: Hosting backend '${be}' on Netlify is not natively supported. Netlify is for frontend and serverless functions.`);
    }

    // 2. Database validation check
    if (db === 'MongoDB' && be === 'Spring Boot') {
      warnings.push('NoSQL Spring Boot check: Ensure MongoDB dependency mappings are configured inside Maven/Gradle.');
    }

    // 3. Platform conflict check
    if (fields.targetPlatform === 'mobile' && fe === 'Next.js') {
      errors.push('Unsupported combination: Next.js is a server-side web framework, which cannot be deployed natively as a mobile application.');
      conflictingTech.push('Next.js', 'mobile');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflictingTech
    };
  }
}

export const requirementsValidator = new RequirementsValidator();
