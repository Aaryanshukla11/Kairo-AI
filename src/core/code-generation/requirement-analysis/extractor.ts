import { ExtractedFields, ConfidenceScores } from './types';

export class PromptExtractor {
  public extract(tokens: string[], cleanedPrompt: string): {
    fields: ExtractedFields;
    scores: ConfidenceScores;
  } {
    const fields: ExtractedFields = {};
    const scores: ConfidenceScores = {
      projectType: 0,
      databasePreference: 0,
      frontendPreference: 0,
      backendPreference: 0,
      authentication: 0,
      deploymentPreference: 0,
      programmingLanguagePreference: 0
    };

    const promptLower = cleanedPrompt.toLowerCase();

    // 1. Project Type Detection
    if (promptLower.includes('hospital') || promptLower.includes('clinic')) {
      fields.projectType = 'Hospital Management';
      scores.projectType = 95;
      fields.domain = 'Healthcare';
    } else if (promptLower.includes('netflix') || promptLower.includes('clone') || promptLower.includes('youtube')) {
      fields.projectType = 'Streaming Application';
      scores.projectType = 90;
      fields.domain = 'Media / Entertainment';
    } else if (promptLower.includes('ecommerce') || promptLower.includes('shop') || promptLower.includes('store')) {
      fields.projectType = 'Ecommerce';
      scores.projectType = 95;
      fields.domain = 'Retail';
    } else if (promptLower.includes('crm') || promptLower.includes('customer relationship')) {
      fields.projectType = 'CRM';
      scores.projectType = 95;
      fields.domain = 'Business Operations';
    } else if (promptLower.includes('dashboard') || promptLower.includes('analytics')) {
      fields.projectType = 'Dashboard';
      scores.projectType = 90;
      fields.domain = 'Business Intelligence';
    } else if (promptLower.includes('api') || promptLower.includes('crud service')) {
      fields.projectType = 'API Service';
      scores.projectType = 85;
      fields.domain = 'Developer Tools';
    }

    // 2. Database Preference
    if (promptLower.includes('postgres') || promptLower.includes('postgresql')) {
      fields.databasePreference = 'PostgreSQL';
      scores.databasePreference = 100;
    } else if (promptLower.includes('mysql')) {
      fields.databasePreference = 'MySQL';
      scores.databasePreference = 100;
    } else if (promptLower.includes('mongodb') || promptLower.includes('mongo')) {
      fields.databasePreference = 'MongoDB';
      scores.databasePreference = 100;
    } else if (promptLower.includes('sqlite')) {
      fields.databasePreference = 'SQLite';
      scores.databasePreference = 100;
    } else {
      // Inferred databases based on stack
      if (fields.projectType === 'Hospital Management') {
        fields.databasePreference = 'PostgreSQL'; // best practice inference
        scores.databasePreference = 40;
      }
    }

    // 3. Frontend Preference
    if (promptLower.includes('reactjs') || promptLower.includes('react')) {
      fields.frontendPreference = 'React';
      scores.frontendPreference = 100;
    } else if (promptLower.includes('nextjs') || promptLower.includes('next.js')) {
      fields.frontendPreference = 'Next.js';
      scores.frontendPreference = 100;
    } else if (promptLower.includes('vue') || promptLower.includes('vuejs')) {
      fields.frontendPreference = 'Vue';
      scores.frontendPreference = 100;
    } else if (promptLower.includes('svelte')) {
      fields.frontendPreference = 'Svelte';
      scores.frontendPreference = 100;
    } else if (promptLower.includes('angular')) {
      fields.frontendPreference = 'Angular';
      scores.frontendPreference = 100;
    }

    // 4. Backend Preference
    if (promptLower.includes('fastapi')) {
      fields.backendPreference = 'FastAPI';
      scores.backendPreference = 100;
    } else if (promptLower.includes('express') || promptLower.includes('expressjs')) {
      fields.backendPreference = 'Express';
      scores.backendPreference = 100;
    } else if (promptLower.includes('nestjs') || promptLower.includes('nest.js')) {
      fields.backendPreference = 'NestJS';
      scores.backendPreference = 100;
    } else if (promptLower.includes('django')) {
      fields.backendPreference = 'Django';
      scores.backendPreference = 100;
    } else if (promptLower.includes('spring boot') || promptLower.includes('springboot')) {
      fields.backendPreference = 'Spring Boot';
      scores.backendPreference = 100;
    }

    // 5. Authentication
    if (promptLower.includes('jwt') || promptLower.includes('json web token')) {
      fields.authentication = 'JWT';
      scores.authentication = 100;
    } else if (promptLower.includes('clerk')) {
      fields.authentication = 'Clerk';
      scores.authentication = 100;
    } else if (promptLower.includes('oauth') || promptLower.includes('oauth2')) {
      fields.authentication = 'OAuth';
      scores.authentication = 100;
    } else if (promptLower.includes('auth.js') || promptLower.includes('nextauth')) {
      fields.authentication = 'Auth.js';
      scores.authentication = 100;
    }

    // 6. Deployment Target
    if (promptLower.includes('docker') || promptLower.includes('compose')) {
      fields.deploymentPreference = 'Docker';
      scores.deploymentPreference = 95;
    } else if (promptLower.includes('vercel')) {
      fields.deploymentPreference = 'Vercel';
      scores.deploymentPreference = 100;
    } else if (promptLower.includes('netlify')) {
      fields.deploymentPreference = 'Netlify';
      scores.deploymentPreference = 100;
    } else if (promptLower.includes('aws') || promptLower.includes('amazon')) {
      fields.deploymentPreference = 'AWS';
      scores.deploymentPreference = 100;
    }

    // 7. Programming Language Preference
    if (promptLower.includes('typescript') || promptLower.includes('ts')) {
      fields.programmingLanguagePreference = 'TypeScript';
      scores.programmingLanguagePreference = 100;
    } else if (promptLower.includes('javascript') || promptLower.includes('js')) {
      fields.programmingLanguagePreference = 'JavaScript';
      scores.programmingLanguagePreference = 100;
    } else if (promptLower.includes('python')) {
      fields.programmingLanguagePreference = 'Python';
      scores.programmingLanguagePreference = 100;
    } else if (promptLower.includes('java')) {
      fields.programmingLanguagePreference = 'Java';
      scores.programmingLanguagePreference = 100;
    }

    // 8. Offline support and Project Modality
    fields.offlineSupport = promptLower.includes('offline') || promptLower.includes('local-only');
    fields.isExistingProject = promptLower.includes('convert') || promptLower.includes('update') || promptLower.includes('modify');
    fields.modificationType = fields.isExistingProject ? 'modification' : 'full';

    // 9. Features
    const mainFeatures: string[] = [];
    if (promptLower.includes('login') || promptLower.includes('signup')) {
      mainFeatures.push('User Session Authentication');
    }
    if (promptLower.includes('dashboard') || promptLower.includes('reports')) {
      mainFeatures.push('Metrics Reporting Dashboard');
    }
    if (fields.projectType === 'Hospital Management') {
      mainFeatures.push('Patient Admissions Registry', 'Consultations Calendar Scheduling');
    }
    fields.mainFeatures = mainFeatures;

    return {
      fields,
      scores
    };
  }
}

export const promptExtractor = new PromptExtractor();
