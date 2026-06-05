import { IEnterpriseRequirement } from '../requirement-schema';
import { IProjectIntelligence } from '../project-intelligence';
import { IEngineeringDecision, IDecisionDetails } from './schema';
import { projectProfileSelector } from './profiles';
import { compatibilityValidator } from './compatibility';
import { recommendationAdvisor } from './recommendation';
import { logger } from '../logger';

export class EngineeringDecisionEngine {
  public decide(
    req: IEnterpriseRequirement,
    intel: IProjectIntelligence
  ): IEngineeringDecision {
    logger.info(`[EngineeringDecisionEngine] Generating technical decisions contract for: '${req.identity.projectName}'`);

    // 1. Select profile and architecture
    const profile = projectProfileSelector.selectProfile(req.identity.projectName, intel);

    // 2. Resolve tech decisions options and trade-offs
    const language = recommendationAdvisor.resolveLanguage(req.stack.frontend ? 'TypeScript' : null);
    const database = recommendationAdvisor.resolveDatabase(req.stack.database);
    const frontend = recommendationAdvisor.resolveFrontend(req.stack.frontend);

    // Baseline fallback decisions mapping
    const backend: IDecisionDetails = {
      primary: req.stack.backend || 'FastAPI',
      secondary: 'Express',
      enterprise: 'NestJS',
      experimental: 'Bun',
      rationale: ['FastAPI is highly asynchronous', 'Excellent automated OpenAPI generation schema docs support'],
      tradeOffs: 'Python execution is slower than Go/Rust options.'
    };

    const authentication: IDecisionDetails = {
      primary: req.stack.authentication || 'JWT',
      secondary: 'Clerk',
      enterprise: 'OAuth2 Provider',
      experimental: 'Passkeys',
      rationale: ['Stateless token validations limit database hits counts'],
      tradeOffs: 'Requires secure cryptographic key storage on client.'
    };

    const deployment: IDecisionDetails = {
      primary: req.stack.deployment || 'Docker',
      secondary: 'Vercel',
      enterprise: 'AWS ECS',
      experimental: 'Fly.io',
      rationale: ['Containers enforce parity between local and cloud staging runtimes'],
      tradeOffs: 'Adds registry repository and runner image compilation step.'
    };

    // 3. Compile validation compatibility checks
    const compatibilityReport = compatibilityValidator.validateStack(
      frontend.primary,
      backend.primary,
      database.primary,
      deployment.primary
    );

    // 4. Formulate configurations specs for future generators codebases
    const generatorConfigs = {
      frontendConfig: {
        framework: frontend.primary,
        bundler: 'Vite',
        styling: 'TailwindCSS',
        stateManagement: 'Redux Toolkit'
      },
      backendConfig: {
        framework: backend.primary,
        language: req.stack.backend === 'Express' ? 'TypeScript' : 'Python',
        orm: req.stack.database === 'PostgreSQL' ? 'Prisma' : 'SQLAlchemy'
      },
      dbConfig: {
        system: database.primary,
        pooling: 'True',
        migrations: 'Alembic'
      }
    };

    const result: IEngineeringDecision = {
      language,
      frontend,
      backend,
      database,
      authentication,
      deployment,
      profile,
      generatorConfigs,
      compatibilityReport
    };

    logger.info(`[EngineeringDecisionEngine] Decisions complete. Profile: ${profile.profileType}, Pattern: ${profile.architecturePattern}, Compatible: ${compatibilityReport.compatible}`);
    return Object.freeze(result);
  }
}

export const engineeringDecisionEngine = new EngineeringDecisionEngine();
export default engineeringDecisionEngine;
export * from './schema';
export * from './profiles';
export * from './scoring';
export * from './compatibility';
export * from './recommendation';
