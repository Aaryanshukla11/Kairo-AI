import { ProjectRequirements, TechnologyStack } from './projectTypes';

export class StackRecommender {
  public recommend(requirements: ProjectRequirements): TechnologyStack {
    const promptLower = requirements.prompt.toLowerCase();

    // 1. Detect Frontend
    let frontend: TechnologyStack['frontend'] = 'React';
    if (promptLower.includes('nextjs') || promptLower.includes('next.js')) {
      frontend = 'Next.js';
    } else if (promptLower.includes('vue')) {
      frontend = 'Vue';
    } else if (promptLower.includes('svelte')) {
      frontend = 'Svelte';
    } else if (promptLower.includes('angular')) {
      frontend = 'Angular';
    }

    // 2. Detect Backend
    let backend: TechnologyStack['backend'] = 'Express';
    if (promptLower.includes('fastapi')) {
      backend = 'FastAPI';
    } else if (promptLower.includes('nestjs') || promptLower.includes('nest.js')) {
      backend = 'NestJS';
    } else if (promptLower.includes('django')) {
      backend = 'Django';
    } else if (promptLower.includes('spring boot') || promptLower.includes('springboot')) {
      backend = 'Spring Boot';
    } else if (promptLower.includes('laravel')) {
      backend = 'Laravel';
    }

    // 3. Detect Database
    let database: TechnologyStack['database'] = 'PostgreSQL';
    if (promptLower.includes('mysql')) {
      database = 'MySQL';
    } else if (promptLower.includes('mongodb')) {
      database = 'MongoDB';
    } else if (promptLower.includes('sqlite')) {
      database = 'SQLite';
    }

    // 4. Detect Authentication
    let authentication: TechnologyStack['authentication'] = 'JWT';
    if (promptLower.includes('oauth')) {
      authentication = 'OAuth';
    } else if (promptLower.includes('clerk')) {
      authentication = 'Clerk';
    } else if (promptLower.includes('auth.js') || promptLower.includes('nextauth')) {
      authentication = 'Auth.js';
    }

    // 5. Detect Deployment
    let deployment: TechnologyStack['deployment'] = 'Docker';
    if (promptLower.includes('vercel')) {
      deployment = 'Vercel';
    } else if (promptLower.includes('netlify')) {
      deployment = 'Netlify';
    } else if (promptLower.includes('aws')) {
      deployment = 'AWS';
    } else if (promptLower.includes('azure')) {
      deployment = 'Azure';
    } else if (promptLower.includes('gcp') || promptLower.includes('google cloud')) {
      deployment = 'GCP';
    }

    return {
      frontend,
      backend,
      database,
      authentication,
      deployment
    };
  }
}

export const stackRecommender = new StackRecommender();
