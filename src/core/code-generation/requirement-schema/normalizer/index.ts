import { ITechnicalStack } from '../contracts';

export class CanonicalNormalizer {
  private normalizations: Record<string, string> = {
    // Languages
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    py: 'Python',
    python: 'Python',
    node: 'Node.js',
    'node.js': 'Node.js',

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
    clerk: 'Clerk',
    'auth.js': 'Auth.js'
  };

  public normalizeStack(stack: ITechnicalStack): ITechnicalStack {
    return {
      frontend: this.lookup(stack.frontend),
      backend: this.lookup(stack.backend),
      database: this.lookup(stack.database),
      authentication: this.lookup(stack.authentication),
      authorization: this.lookup(stack.authorization),
      deployment: this.lookup(stack.deployment),
      testing: this.lookup(stack.testing),
      documentation: this.lookup(stack.documentation)
    };
  }

  private lookup(val: string): string {
    const key = val.trim().toLowerCase();
    return this.normalizations[key] || val;
  }
}

export const canonicalNormalizer = new CanonicalNormalizer();
export default canonicalNormalizer;
