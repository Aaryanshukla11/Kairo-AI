import { ExtractedFields } from './types';

export class TermNormalizer {
  private normalizations: Record<string, string> = {
    // Languages
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    py: 'Python',
    python: 'Python',

    // Frontends
    react: 'React',
    reactjs: 'React',
    nextjs: 'Next.js',
    'next.js': 'Next.js',
    vue: 'Vue',
    vuejs: 'Vue',
    svelte: 'Svelte',
    angular: 'Angular',

    // Backends
    fastapi: 'FastAPI',
    express: 'Express',
    expressjs: 'Express',
    nestjs: 'NestJS',
    'nest.js': 'NestJS',
    django: 'Django',
    springboot: 'Spring Boot',
    'spring boot': 'Spring Boot',

    // Databases
    postgres: 'PostgreSQL',
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    mongodb: 'MongoDB',
    mongo: 'MongoDB',
    sqlite: 'SQLite',

    // Authentication
    jwt: 'JWT',
    oauth: 'OAuth',
    oauth2: 'OAuth',
    clerk: 'Clerk',
    'auth.js': 'Auth.js',
    nextauth: 'Auth.js',

    // Deployments
    docker: 'Docker',
    vercel: 'Vercel',
    netlify: 'Netlify',
    aws: 'AWS',
    azure: 'Azure',
    gcp: 'GCP'
  };

  public normalize(fields: ExtractedFields): ExtractedFields {
    const normalized = { ...fields };

    if (normalized.frontendPreference) {
      normalized.frontendPreference = this.lookup(normalized.frontendPreference);
    }
    if (normalized.backendPreference) {
      normalized.backendPreference = this.lookup(normalized.backendPreference);
    }
    if (normalized.databasePreference) {
      normalized.databasePreference = this.lookup(normalized.databasePreference);
    }
    if (normalized.authentication) {
      normalized.authentication = this.lookup(normalized.authentication);
    }
    if (normalized.deploymentPreference) {
      normalized.deploymentPreference = this.lookup(normalized.deploymentPreference);
    }
    if (normalized.programmingLanguagePreference) {
      normalized.programmingLanguagePreference = this.lookup(normalized.programmingLanguagePreference);
    }

    return normalized;
  }

  private lookup(val: string): string {
    const key = val.trim().toLowerCase();
    return this.normalizations[key] || val;
  }
}

export const termNormalizer = new TermNormalizer();
